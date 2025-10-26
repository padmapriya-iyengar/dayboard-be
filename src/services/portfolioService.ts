import sql from "mssql";
import { getPool } from "../config/database";
import {
  PersonPortfolio,
  AccountPortfolio,
  PortfolioSummary,
  PortfolioResponse,
} from "../types";

export class PortfolioService {
  // Conversion rates
  private static readonly AED_TO_INR = 23;
  private static readonly INR_TO_AED = 1 / 23;

  /**
   * Get portfolio data for all persons with their account summaries
   */
  static async getPortfolioData(): Promise<PortfolioResponse> {
    try {
      const pool = getPool();

      // Get all expense data with person, account, and currency information
      const query = `
        SELECT 
          p.Id as PersonId,
          p.Name as PersonName,
          pa.Id as AccountId,
          pa.Account as AccountName,
          pa.Currency,
          ISNULL(COUNT(e.Id), 0) as ExpenseCount,
          ISNULL(SUM(e.Amount), 0) as TotalAmount,
          ISNULL(SUM(CASE WHEN e.isDebit = 1 THEN e.Amount ELSE 0 END), 0) as DebitAmount,
          ISNULL(SUM(CASE WHEN e.isDebit = 0 THEN e.Amount ELSE 0 END), 0) as CreditAmount
        FROM Person_Details p
        INNER JOIN Person_Account pa ON p.Id = pa.Person_Id
        LEFT JOIN Expense_Details e ON pa.Id = e.Account_Id
        WHERE pa.Currency IN ('AED', 'INR')
        GROUP BY p.Id, p.Name, pa.Id, pa.Account, pa.Currency
        ORDER BY p.Name, pa.Account
      `;

      const result = await pool.request().query(query);
      const rawData = result.recordset;

      // Process the data to create portfolio structure
      const portfolios = this.processPortfolioData(rawData);
      const summary = this.calculatePortfolioSummary(portfolios, rawData);

      return {
        status: "success",
        message: "Portfolio data retrieved successfully",
        data: {
          summary,
          portfolios,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in getPortfolioData:", error);
      throw new Error(
        `Failed to retrieve portfolio data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get portfolio data for a specific person
   */
  static async getPersonPortfolio(
    personId: number
  ): Promise<PersonPortfolio | null> {
    try {
      const pool = getPool();

      const query = `
        SELECT 
          p.Id as PersonId,
          p.Name as PersonName,
          pa.Id as AccountId,
          pa.Account as AccountName,
          pa.Currency,
          ISNULL(COUNT(e.Id), 0) as ExpenseCount,
          ISNULL(SUM(e.Amount), 0) as TotalAmount,
          ISNULL(SUM(CASE WHEN e.isDebit = 1 THEN e.Amount ELSE 0 END), 0) as DebitAmount,
          ISNULL(SUM(CASE WHEN e.isDebit = 0 THEN e.Amount ELSE 0 END), 0) as CreditAmount
        FROM Person_Details p
        INNER JOIN Person_Account pa ON p.Id = pa.Person_Id
        LEFT JOIN Expense_Details e ON pa.Id = e.Account_Id
        WHERE p.Id = @personId AND pa.Currency IN ('AED', 'INR')
        GROUP BY p.Id, p.Name, pa.Id, pa.Account, pa.Currency
        ORDER BY pa.Account
      `;

      const result = await pool
        .request()
        .input("personId", sql.Int, personId)
        .query(query);

      if (result.recordset.length === 0) {
        return null;
      }

      const portfolios = this.processPortfolioData(result.recordset);
      return portfolios.length > 0 ? portfolios[0] : null;
    } catch (error) {
      console.error("Error in getPersonPortfolio:", error);
      throw new Error(
        `Failed to retrieve person portfolio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Process raw database data into portfolio structure
   */
  private static processPortfolioData(rawData: any[]): PersonPortfolio[] {
    const personsMap = new Map<number, PersonPortfolio>();

    rawData.forEach((row) => {
      const personId = row.PersonId;

      // Initialize person if not exists
      if (!personsMap.has(personId)) {
        personsMap.set(personId, {
          personId,
          personName: row.PersonName,
          accounts: [],
          totals: {
            aed: {
              totalAmount: 0,
              debitAmount: 0,
              creditAmount: 0,
              netAmount: 0,
            },
            inr: {
              totalAmount: 0,
              debitAmount: 0,
              creditAmount: 0,
              netAmount: 0,
            },
          },
        });
      }

      const person = personsMap.get(personId)!;

      // Skip if no account data
      if (!row.AccountId) {
        return;
      }

      // Process account data
      const totalAmount = row.TotalAmount || 0;
      const debitAmount = row.DebitAmount || 0;
      const creditAmount = row.CreditAmount || 0;
      const netAmount = creditAmount - debitAmount;
      const currency = row.Currency?.toUpperCase();

      const accountPortfolio: AccountPortfolio = {
        accountId: row.AccountId,
        accountName: row.AccountName,
        currency: currency,
        amounts: {
          totalAmount,
          debitAmount,
          creditAmount,
          netAmount,
          expenseCount: row.ExpenseCount || 0,
        },
        convertedAmounts: this.calculateConvertedAmounts(
          totalAmount,
          debitAmount,
          creditAmount,
          netAmount,
          currency
        ),
      };

      person.accounts.push(accountPortfolio);

      // Add to person totals based on original currency
      if (currency === "AED") {
        person.totals.aed.totalAmount += totalAmount;
        person.totals.aed.debitAmount += debitAmount;
        person.totals.aed.creditAmount += creditAmount;
        person.totals.aed.netAmount += netAmount;

        // Convert to INR and add
        person.totals.inr.totalAmount += totalAmount * this.AED_TO_INR;
        person.totals.inr.debitAmount += debitAmount * this.AED_TO_INR;
        person.totals.inr.creditAmount += creditAmount * this.AED_TO_INR;
        person.totals.inr.netAmount += netAmount * this.AED_TO_INR;
      } else if (currency === "INR") {
        person.totals.inr.totalAmount += totalAmount;
        person.totals.inr.debitAmount += debitAmount;
        person.totals.inr.creditAmount += creditAmount;
        person.totals.inr.netAmount += netAmount;

        // Convert to AED and add
        person.totals.aed.totalAmount += totalAmount * this.INR_TO_AED;
        person.totals.aed.debitAmount += debitAmount * this.INR_TO_AED;
        person.totals.aed.creditAmount += creditAmount * this.INR_TO_AED;
        person.totals.aed.netAmount += netAmount * this.INR_TO_AED;
      }
    });

    return Array.from(personsMap.values());
  }

  /**
   * Calculate converted amounts for both currencies
   */
  private static calculateConvertedAmounts(
    totalAmount: number,
    debitAmount: number,
    creditAmount: number,
    netAmount: number,
    currency: string
  ) {
    const convertedAmounts = {
      aed: { totalAmount: 0, debitAmount: 0, creditAmount: 0, netAmount: 0 },
      inr: { totalAmount: 0, debitAmount: 0, creditAmount: 0, netAmount: 0 },
    };

    if (currency === "AED") {
      // Original amounts in AED
      convertedAmounts.aed = {
        totalAmount,
        debitAmount,
        creditAmount,
        netAmount,
      };

      // Convert to INR
      convertedAmounts.inr = {
        totalAmount: totalAmount * this.AED_TO_INR,
        debitAmount: debitAmount * this.AED_TO_INR,
        creditAmount: creditAmount * this.AED_TO_INR,
        netAmount: netAmount * this.AED_TO_INR,
      };
    } else if (currency === "INR") {
      // Original amounts in INR
      convertedAmounts.inr = {
        totalAmount,
        debitAmount,
        creditAmount,
        netAmount,
      };

      // Convert to AED
      convertedAmounts.aed = {
        totalAmount: totalAmount * this.INR_TO_AED,
        debitAmount: debitAmount * this.INR_TO_AED,
        creditAmount: creditAmount * this.INR_TO_AED,
        netAmount: netAmount * this.INR_TO_AED,
      };
    }

    return convertedAmounts;
  }

  /**
   * Calculate overall portfolio summary
   */
  private static calculatePortfolioSummary(
    portfolios: PersonPortfolio[],
    rawData: any[]
  ): PortfolioSummary {
    const summary: PortfolioSummary = {
      totalPersons: portfolios.length,
      totalAccounts: 0,
      totalExpenses: 0,
      grandTotals: {
        aed: { totalAmount: 0, debitAmount: 0, creditAmount: 0, netAmount: 0 },
        inr: { totalAmount: 0, debitAmount: 0, creditAmount: 0, netAmount: 0 },
      },
      conversionRate: {
        aedToInr: this.AED_TO_INR,
        inrToAed: this.INR_TO_AED,
      },
      generatedAt: new Date().toISOString(),
    };

    // Calculate totals from portfolios
    portfolios.forEach((portfolio) => {
      summary.totalAccounts += portfolio.accounts.length;

      portfolio.accounts.forEach((account) => {
        summary.totalExpenses += account.amounts.expenseCount;
      });

      // Add to grand totals (avoiding double conversion since portfolios already have converted totals)
      summary.grandTotals.aed.totalAmount += portfolio.totals.aed.totalAmount;
      summary.grandTotals.aed.debitAmount += portfolio.totals.aed.debitAmount;
      summary.grandTotals.aed.creditAmount += portfolio.totals.aed.creditAmount;
      summary.grandTotals.aed.netAmount += portfolio.totals.aed.netAmount;

      summary.grandTotals.inr.totalAmount += portfolio.totals.inr.totalAmount;
      summary.grandTotals.inr.debitAmount += portfolio.totals.inr.debitAmount;
      summary.grandTotals.inr.creditAmount += portfolio.totals.inr.creditAmount;
      summary.grandTotals.inr.netAmount += portfolio.totals.inr.netAmount;
    });

    // Round all amounts to 2 decimal places
    this.roundAmounts(summary.grandTotals.aed);
    this.roundAmounts(summary.grandTotals.inr);

    return summary;
  }

  /**
   * Round amounts to 2 decimal places
   */
  private static roundAmounts(amounts: any) {
    amounts.totalAmount = Math.round(amounts.totalAmount * 100) / 100;
    amounts.debitAmount = Math.round(amounts.debitAmount * 100) / 100;
    amounts.creditAmount = Math.round(amounts.creditAmount * 100) / 100;
    amounts.netAmount = Math.round(amounts.netAmount * 100) / 100;
  }

  /**
   * Get currency exchange rates (future enhancement - could be from external API)
   */
  static getExchangeRates() {
    return {
      aedToInr: this.AED_TO_INR,
      inrToAed: this.INR_TO_AED,
      lastUpdated: new Date().toISOString(),
    };
  }
}

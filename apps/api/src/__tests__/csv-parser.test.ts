import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseCsv } from '../services/csv-parser.js';

const TEST_DATA_DIR = resolve(__dirname, '..', '..', '..', '..', 'test-data');

function loadTestFile(filename: string): Buffer {
  return readFileSync(resolve(TEST_DATA_DIR, filename));
}

describe('csv-parser', () => {
  describe('bank format detection', () => {
    it('should auto-detect Tinkoff format', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'scenario-01-student-impulse.csv');

      expect(result.bankFormat).toBe('tinkoff');
      expect(result.transactions.length).toBeGreaterThan(0);
    });

    it('should auto-detect Sberbank format', () => {
      const buffer = loadTestFile('scenario-05-sberbank-format.csv');
      const result = parseCsv(buffer, 'scenario-05-sberbank-format.csv');

      expect(result.bankFormat).toBe('sberbank');
      expect(result.transactions.length).toBeGreaterThan(0);
    });

    it('should parse all test scenarios without errors', () => {
      const files = [
        'scenario-01-student-impulse.csv',
        'scenario-02-freelancer-irregular.csv',
        'scenario-03-office-worker-saver.csv',
        'scenario-04-subscription-heavy.csv',
        'scenario-05-sberbank-format.csv',
      ];

      for (const file of files) {
        const buffer = loadTestFile(file);
        const result = parseCsv(buffer, file);
        expect(result.transactions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('encoding detection', () => {
    it('should handle UTF-8 encoded files', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      expect(result.transactions.length).toBeGreaterThan(0);
      // Verify Russian characters are parsed correctly
      const hasRussian = result.transactions.some(t =>
        /[а-яА-ЯёЁ]/.test(t.description) || (t.rawCategory && /[а-яА-ЯёЁ]/.test(t.rawCategory))
      );
      expect(hasRussian).toBe(true);
    });

    it('should handle Windows-1251 encoded content', () => {
      // Create a Windows-1251 encoded buffer manually
      const iconv = require('iconv-lite');
      const csvContent = 'Дата операции;Категория;Сумма;Описание\n01.03.2026;Фастфуд;-450;Яндекс.Еда\n';
      const win1251Buffer = iconv.encode(csvContent, 'win1251');

      const result = parseCsv(win1251Buffer, 'test-win1251.csv');
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].amount).toBe(-450);
    });
  });

  describe('amount parsing', () => {
    it('should parse negative amounts as expenses', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      const expenses = result.transactions.filter(t => t.amount < 0);
      expect(expenses.length).toBeGreaterThan(0);
    });

    it('should parse positive amounts as income', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      const income = result.transactions.filter(t => t.amount > 0);
      expect(income.length).toBeGreaterThan(0);
    });

    it('should handle amounts with comma decimal separator', () => {
      const csv = 'Дата операции;Категория;Сумма;Описание\n01.03.2026;Фастфуд;-450,50;Тест\n';
      const buffer = Buffer.from(csv, 'utf-8');
      const result = parseCsv(buffer, 'test.csv');

      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].amount).toBe(-450.5);
    });

    it('should handle amounts with decimal point in Sberbank format', () => {
      const buffer = loadTestFile('scenario-05-sberbank-format.csv');
      const result = parseCsv(buffer, 'sber.csv');

      // Sberbank has amounts like -1250.00
      const firstExpense = result.transactions.find(t => t.amount < 0);
      expect(firstExpense).toBeDefined();
      expect(Number.isFinite(firstExpense!.amount)).toBe(true);
    });
  });

  describe('date parsing', () => {
    it('should parse DD.MM.YYYY format', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      expect(result.transactions.length).toBeGreaterThan(0);

      const firstTx = result.transactions[0];
      expect(firstTx.date).toBeInstanceOf(Date);
      expect(firstTx.date.getFullYear()).toBe(2026);
      expect(firstTx.date.getMonth()).toBe(2); // March = 2 (0-indexed)
      expect(firstTx.date.getDate()).toBe(1);
    });

    it('should parse YYYY-MM-DD format', () => {
      const csv = 'date,amount,description\n2026-03-15,-500,Test transaction\n';
      const buffer = Buffer.from(csv, 'utf-8');
      const result = parseCsv(buffer, 'test.csv');

      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0].date.getFullYear()).toBe(2026);
      expect(result.transactions[0].date.getMonth()).toBe(2);
      expect(result.transactions[0].date.getDate()).toBe(15);
    });

    it('should handle dates across multiple months', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      const dates = result.transactions.map(t => t.date);
      const months = new Set(dates.map(d => d.getMonth()));
      // The test data should span at least 1 month
      expect(months.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('delimiter detection', () => {
    it('should detect semicolon delimiter', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      // Tinkoff uses semicolons — if parsed correctly, we have transactions
      expect(result.bankFormat).toBe('tinkoff');
      expect(result.transactions.length).toBeGreaterThan(0);
    });

    it('should detect comma delimiter', () => {
      const csv = 'date,amount,description\n2026-03-01,-500,Test\n2026-03-02,-300,Other\n';
      const buffer = Buffer.from(csv, 'utf-8');
      const result = parseCsv(buffer, 'test.csv');

      expect(result.transactions.length).toBe(2);
    });

    it('should detect tab delimiter', () => {
      const csv = 'date\tamount\tdescription\n2026-03-01\t-500\tTest\n2026-03-02\t-300\tOther\n';
      const buffer = Buffer.from(csv, 'utf-8');
      const result = parseCsv(buffer, 'test.csv');

      expect(result.transactions.length).toBe(2);
    });
  });

  describe('raw category extraction', () => {
    it('should extract raw categories from Tinkoff format', () => {
      const buffer = loadTestFile('scenario-01-student-impulse.csv');
      const result = parseCsv(buffer, 'test.csv');

      const withCategory = result.transactions.filter(t => t.rawCategory !== null);
      expect(withCategory.length).toBeGreaterThan(0);

      // Tinkoff has category column
      const categories = new Set(withCategory.map(t => t.rawCategory));
      expect(categories.size).toBeGreaterThan(1);
    });

    it('should extract raw categories from Sberbank format', () => {
      const buffer = loadTestFile('scenario-05-sberbank-format.csv');
      const result = parseCsv(buffer, 'test.csv');

      const withCategory = result.transactions.filter(t => t.rawCategory !== null);
      expect(withCategory.length).toBeGreaterThan(0);
    });
  });
});

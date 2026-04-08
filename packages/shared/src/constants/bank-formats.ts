export interface BankFormatConfig {
  name: string;
  delimiter: string;
  encoding: string;
  headerPatterns: string[];
  columns: {
    date: string;
    amount: string;
    description: string;
    category?: string;
  };
  dateFormats: string[];
  amountSign: 'standard' | 'inverted'; // standard = negative is expense
}

export const BANK_FORMATS: Record<string, BankFormatConfig> = {
  tinkoff: {
    name: 'Тинькофф / Т-Банк',
    delimiter: ';',
    encoding: 'utf-8',
    headerPatterns: ['Дата операции', 'Категория', 'Сумма'],
    columns: { date: 'Дата операции', amount: 'Сумма', description: 'Описание', category: 'Категория' },
    dateFormats: ['DD.MM.YYYY'],
    amountSign: 'standard',
  },
  sberbank: {
    name: 'Сбербанк',
    delimiter: ';',
    encoding: 'utf-8',
    headerPatterns: ['Номер карты', 'Статус', 'Сумма операции'],
    columns: { date: 'Дата', amount: 'Сумма операции', description: 'Описание', category: 'Категория' },
    dateFormats: ['DD.MM.YYYY'],
    amountSign: 'standard',
  },
  alfa: {
    name: 'Альфа-Банк',
    delimiter: ',',
    encoding: 'utf-8',
    headerPatterns: ['mcc'],
    columns: { date: 'date', amount: 'amount', description: 'description' },
    dateFormats: ['YYYY-MM-DD', 'DD.MM.YYYY'],
    amountSign: 'standard',
  },
};

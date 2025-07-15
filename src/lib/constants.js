export const MAXIMUM_TABLE_ROWS_PER_PAGE = 20;
export const API_BASE_URL = "http://localhost:8080/api/v1";

export const COLLECTION_LINKS = [
  { label: "Статусы", href: "status" },
  { label: "Приоритеты", href: "priority" },
  { label: "Департаменты", href: "department" },
  { label: "Отделы", href: "otdel" },
  { label: "Филиалы", href: "branch" },
  { label: "Офисы ЦБО", href: "office" },
  { label: "Роли", href: "role" },
  { label: "Привелигии", href: "permission" },
  { label: "Оборудования", href: "equipment_type" },
];

export const EQUIPMENT_SUBLINKS = [
  { label: "Банкоматы", href: "atm" },
  { label: "Терминалы", href: "terminal" },
  { label: "POS-терминалы", href: "pos" },
  { label: "ЦО+ЭО", href: "coeo" },
];

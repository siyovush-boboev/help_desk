export const MAXIMUM_TABLE_ROWS_PER_PAGE = 20;
export const API_BASE_URL = "http://localhost:8080/api/v1";

export const COLLECTION_LINKS = [
  { label: "Статусы", href: "/collections/statuses" },
  { label: "Приоритеты", href: "/collections/priorities" },
  { label: "Департаменты", href: "/collections/departments" },
  { label: "Отделы", href: "/collections/divisions" },
  { label: "Филиалы", href: "/collections/branches" },
  { label: "Офисы ЦБО", href: "/collections/cbo-offices" },
  { label: "Роли", href: "/collections/roles" },
  { label: "Привелигии", href: "/collections/privileges" },
  { label: "Оборудования", href: "/collections/equipment" },
];

export const EQUIPMENT_SUBLINKS = [
  { label: "Банкоматы", href: "/collections/equipment/atms" },
  { label: "Терминалы", href: "/collections/equipment/terminals" },
  { label: "POS-терминалы", href: "/collections/equipment/pos-terminals" },
  { label: "ЦО+ЭО", href: "/collections/equipment/co-eo" },
];

export const TABLE_COLUMNS = {
  orders: {
				"CHECKMARK": null,
				"№": "id",
				"Статус": "status_id",
				"Приоритет": "priority_id",
				"Наименование заявки": "name",
				"Заявитель": "user_id",
				"Дата создания": "created_at",
				"Исполнитель": "",
				"Срок": "duration"
  },
  users: {
				"CHECKMARK": null,
				"Имя": "fio",
				"Департамент": "department_id",
				"Отдел": "otdel_id",
				"Роль": "role_id",
				"Телефон": "phoneNumber",
				"E-mail": "email",
				"Действия": null
  },
  // etc
};

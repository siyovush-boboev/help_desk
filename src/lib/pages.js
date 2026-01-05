export const TABLE_PAGES_CONFIG = {
  main: {
    singular: "Дашборд",
    plural: "Дашборд",
    resource: "dashboard",
    preload: ["department", "otdel", "status", "priority", "branch", "office", "equipment", "equipment_type", "user", "position", "order_type", "order_rule"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Открыто": "open",
      "Закрыто": "closed",
      "Всего": null
    }
  },
  order: {
    singular: "Заявка",
    plural: "Заявки",
    resource: "order",
    preload: ["department", "otdel", "status", "priority", "branch", "office", "equipment", "equipment_type", "user", "position", "order_type", "order_rule"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование заявки": "name",
      "Статус": "status_id",
      "Приоритет": "priority_id",
      "Заявитель": null,
      "Дата создания": "created_at",
      "Исполнитель": null,
      "Срок": "duration",
      "Оборудование": "equipment_id",
      "Тип оборудования": "equipment_type_id",
    },
    filters: [
      {id: "status_id", label: "Статус"},
      {id: "priority_id", label: "Приоритет"},
      // {id: "user_id", label: "Заявитель"},
      // {id: "executor_id", label: "Исполнитель"},
      {id: "department_id", label: "Департамент"},
      {id: "otdel_id", label: "Отдел"},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"}
    ]
  },
  user: {
    singular: "Пользователь",
    plural: "Пользователи",
    resource: "user",
    permissions_resource: "user/permission",
    preload: ["department", "otdel", "branch", "office", "role", "status", "position", "permission"],
    columns: {
      "Имя": "fio",
      "Департамент": "department_id",
      "Отдел": "otdel_id",
      "Филиал": "branch_id",
      "Телефон": "phone_number",
      "E-mail": "email",
      "Должность": "position_id",
      "Действия": null
    },
    filters: [
      {id: "department_id", label: "Департамент"},
      {id: "otdel_id", label: "Отдел"},
      {id: "role_id", label: "Роль"},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"},
    ]
  },
  status: {
    singular: "Статус",
    plural: "Статусы",
    resource: "status",
    preload: [],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Иконка": "icon_small",
      "Наименование": "name",
      "Тип": "type",
      "Действия": null
    }
  },
  priority: {
    singular: "Приоритет",
    plural: "Приоритеты",
    resource: "priority",
    preload: [],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Тип": "rate",
      "Действия": null
    }
  },
  department: {
    singular: "Департамент",
    plural: "Департаменты",
    resource: "department",
    preload: ["status"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "status_id", label: "Статус"}
    ]
  },
  otdel: {
    singular: "Отдел",
    plural: "Отделы",
    resource: "otdel",
    preload: ["department", "status", "branch", "otdel"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Департамент": "department_id",
      "Отдел": "otdel_id",
      "Филиал": "branch_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "department_id", label: "Департамент"},
      {id: "status_id", label: "Статус"}
    ]
  },
  branch: {
    singular: "Филиал",
    plural: "Филиалы",
    resource: "branch",
    preload: ["status"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Адрес": "address",
      "Дата открытия": "open_date",
      "Почтовый индекс": "email_index",
      "Короткое наименование": "short_name",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "status_id", label: "Статус"},
    ]
  },
  office: {
    singular: "Офис ЦБО",
    plural: "Офисы ЦБО",
    resource: "office",
    preload: ["branch", "status"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Адрес": "address",
      "Дата открытия": "open_date",
      "Филиал": "branch_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "branch_id", label: "Филиал"},
      {id: "status_id", label: "Статус"}
    ]
  },
  role: {
    singular: "Роль",
    plural: "Роли",
    resource: "role",
    preload: ["permission"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Описание": "description",
      "Действия": null
    }
  },
  permission: {
    singular: "Привелигия",
    plural: "Привелигии",
    resource: "permission",
    preload: [],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Описание": "description",
      "Действия": null
    }
  },
  position: {
    singular: "Должность",
    plural: "Должности",
    resource: "position",
    preload: ["status", "position_type"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Статус": "status_id",
      "Тип": "type",
      "Действия": null
    }
  },
  order_type: {
    singular: "Тип заявки",
    plural: "Типы заявок",
    resource: "order_type",
    preload: ["status"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "status_id", label: "Статус"}
    ]
  },
  order_rule: {
    singular: "Правило заявки",
    plural: "Правила заявок",
    resource: "order_rule",
    preload: ["order_type", "department", "otdel", "position", "status", "position_type", "branch", "office"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Тип заявки": "order_type_id",
      "Департамент": "department_id",
      "Отдел": "otdel_id",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Должность": "position_type_name",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "order_type_id", label: "Тип заявки"},
      {id: "department_id", label: "Департамент"},
      {id: "otdel_id", label: "Отдел"},
      {id: "status_id", label: "Статус"}
    ]
  },
  equipment_type: {
    singular: "Тип оборудования",
    plural: "Типы оборудований",
    resource: "equipment_type",
    preload: [],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Наименование": "name",
      "Действия": null
    }
  },
  equipment: {
    singular: "Оборудование",
    plural: "Оборудования",
    resource: "equipment",
    preload: ["branch", "office", "equipment_type", "status"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Номер оборудования": "name",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Адрес оборудования": "address",
      "Тип оборудования": "equipment_type_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "equipment_type_id", label: "Тип оборудования"},
      {id: "status_id", label: "Статус"},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"},
    ]
  },
  report: {
    singular: "Отчет",
    plural: "Отчеты",
    resource: "report",
    preload: ["user", "order_type", "priority"],
    filters: [
      {id: "date_from", label: "Начальная дата"},
      {id: "date_to", label: "Конечная дата"},
      {id: "order_type_ids", label: "Тип заявки"},
      {id: "priority_ids", label: "Приоритет"},
      {id: "executor_ids", label: "Пользователь"},
    ],
  },
  setting: {
    singular: "Настройка",
    plural: "Настройки",
    resource: "setting",
    preload: [],
  }
};


export const FORM_CONFIG = {
  order: {
    order_type_id: { label: "Тип заявки", type: "select", required: true },
    name: { label: "Наименование заявки", type: "text", required: true, min: 5, width: "100%" },
    comment: { label: "Описание", type: "textarea", required: false, min: 3, width: "100%" },
    department_id: { label: "Департамент", type: "select", required: false, width: "33%" },
    otdel_id: { label: "Отдел", type: "select", required: false, width: "33%" },
    executor_id: { label: "Исполнитель", type: "select", required: false, width: "33%" },
    status_id: { label: "Статус", type: "select", required: true, width: "33%" },
    priority_id: { label: "Приоритет", type: "select", required: false, width: "33%" },
    duration: { label: "Срок", type: "datetime-local", required: false, width: "33%" },
    branch_id: { label: "Филиал", type: "select", required: false },
    office_id: { label: "Офис ЦБО", type: "select", required: false },
    equipment_type_id: { label: "Тип оборудования", type: "select", required: false },
    equipment_id: { label: "Оборудование", type: "select", required: false },
    address: { label: "Адрес", type: "text", required: false, min: 5, width: "100%" },
    file: { label: "Вложение", type: "file", required: false },
  },
  order_type: {
    name: { label: "Наименование", type: "text", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  order_rule: {
    name: { label: "Наименование", type: "text", required: true },
    order_type_id: { label: "Тип заявки", type: "select", required: true },
    department_id: { label: "Департамент", type: "select", required: false },
    otdel_id: { label: "Отдел", type: "select", required: false },
    branch_id: { label: "Филиал", type: "select", required: false },
    office_id: { label: "Офис ЦБО", type: "select", required: false },
    position_type: { label: "Должность", type: "select", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  user: {
    fio: { label: "Имя", type: "text", required: true },
    username: { label: "Логин", type: "search_select", required: false },
    department_id: { label: "Департамент", type: "select", required: false },
    otdel_id: { label: "Отдел", type: "select", required: false },
    branch_id: { label: "Филиал", type: "select", required: false },
    office_id: { label: "Офис ЦБО", type: "select", required: false },
    role_ids: { label: "Роль", type: "multiselect", required: true },
    position_id: { label: "Должность", type: "select", required: true },
    phone_number: { label: "Телефон", type: "text", required: true },
    email: { label: "E-mail / Логин", type: "email", required: true },
    photoFile: { label: "Фото", type: "file", required: false },
    status_id: { label: "Статус", type: "select", required: false },
  },
  individual_permissions: {
    permissions: { label: "Привелигия", type: "multiselect", required: false, width: "100%" },
  },
  status: {
    name: { label: "Наименование", type: "text", required: true },
    type: { label: "Тип", type: "number", required: true },
    icon_big: { label: "Иконка (большая)", type: "file", required: false },
    icon_small: { label: "Иконка (маленькая)", type: "file", required: false },
  },
  priority: {
    name: { label: "Наименование", type: "text", required: true },
    rate: { label: "Тип", type: "number", required: true },
  },
  department: {
    name: { label: "Наименование", type: "text", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  otdel: {
    name: { label: "Наименование", type: "text", required: true, width: "100%" },
    department_id: { label: "Департамент", type: "select", required: false },
    otdel_id: { label: "Отдел", type: "select", required: false },
    branch_id: { label: "Филиал", type: "select", required: false },
    status_id: { label: "Статус", type: "select", required: true },
  },
  branch: {
    name: { label: "Наименование", type: "text", required: true },
    address: { label: "Адрес", type: "text", required: false, width: "100%" },
    short_name: { label: "Короткое наименование", type: "text", required: false },
    email_index: { label: "Почтовый индекс", type: "text", required: false },
    open_date: { label: "Дата открытия", type: "date", required: false },
    status_id: { label: "Статус", type: "select", required: true },
  },
  office: {
    name: { label: "Наименование", type: "text", required: true },
    branch_id: { label: "Филиал", type: "select", required: true },
    open_date: { label: "Дата открытия", type: "date", required: false },
    status_id: { label: "Статус", type: "select", required: true },
    address: { label: "Адрес", type: "text", required: false, width: "100%" },
  },
  role: {
    name: { label: "Наименование", type: "text", required: true },
    description: { label: "Описание", type: "textarea", required: false, width: "100%" },
    permissions: { label: "Привелигия", type: "multiselect", required: true },
  },
  permission: {
    name: { label: "Наименование", type: "text", required: true },
    description: { label: "Описание", type: "textarea", required: false, width: "100%" },
  },
  position: {
    name: { label: "Наименование", type: "text", required: true, width: "100%" },
    status_id: { label: "Статус", type: "select", required: true },
    type: { label: "Тип", type: "select", required: false },
  },
  equipment_type: {
    name: { label: "Наименование", type: "text", required: true },
  },
  equipment: {
      name: { label: "Номер оборудования", type: "text", required: true },
      address: { label: "Адрес оборудования", type: "text", required: false, width: "100%" },
      branch_id: { label: "Филиал", type: "select", required: true },
      office_id: { label: "Офис ЦБО", type: "select", required: true },
      equipment_type_id: { label: "Тип оборудования", type: "select", required: true },
      status_id: { label: "Статус", type: "select", required: true },
  },
};
FORM_CONFIG["main"] = FORM_CONFIG["order"];

export const DEPENDANT_FIELDS = {
  desc: {
    department_id: ["otdel_id", "executor_id"],
    otdel_id: ["executor_id"],
    branch_id: ["office_id", "equipment_id"],
    office_id: ["equipment_id"],
    equipment_type_id: ["equipment_id"]
  },
};

// add "asc" key which is the reverse of "desc"
DEPENDANT_FIELDS.asc = Object.entries(DEPENDANT_FIELDS.desc).reduce((acc, [key, values]) => {
  values.forEach(value => {
    if (!acc[value]) acc[value] = [];
    acc[value].push(key);
  });
  return acc;
}, {});

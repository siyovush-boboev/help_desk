export const TABLE_PAGES_CONFIG = {
  main: {
    singular: "Главная",
    plural: "Главная",
    resource: "main",
    preload: ["department", "otdel", "status", "priority", "branch", "office", "equipment", "user"],
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
    preload: ["department", "otdel", "status", "priority", "branch", "office", "equipment", "user"],
    columns: {
      "CHECKMARK": null,
      "№": null,
      "Статус": "status_id",
      "Приоритет": "priority_id",
      "Наименование заявки": "name",
      "Заявитель": "user_id",
      "Дата создания": "created_at",
      "Исполнитель": null,
      "Срок": "duration"
    },
    filters: [
      {id: "status_id", label: "Статус"},
      {id: "priority_id", label: "Приоритет"},
      {id: "user_id", label: "Заявитель"},
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
    preload: ["department", "otdel", "branch", "office", "role"],
    columns: {
      "Имя": "fio",
      "Департамент": "department_id",
      "Отдел": "otdel_id",
      "Роль": "role_id",
      "Телефон": "phone_number",
      "E-mail": "email",
      "Действия": null
    },
    filters: [
      {id: "department_id", label: "Департамент"},
      {id: "otdel_id", label: "Отдел"},
      {id: "role_id", label: "Роль"},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"}
    ]
  },
  status: {
    singular: "Статус",
    plural: "Статусы",
    resource: "status",
    preload: [],
    columns: {
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
      "№": null,
      "Иконка": "icon_small",
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
    preload: ["department", "status"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Департамент": "department_id",
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
      "№": null,
      "Наименование": "name",
      "Адрес": "address",
      "Дата открытия": "open_date",
      "Почтовый адресс": "email",
      "Телефон": "phone_number",
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
      "№": null,
      "Наименование": "name",
      "Описание": "description",
      "Действия": null
    }
  },
  equipment_type: {
    singular: "Тип оборудования",
    plural: "Типы оборудований",
    resource: "equipment_type",
    preload: [],
    columns: {
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
    preload: [],
  },
  setting: {
    singular: "Настройка",
    plural: "Настройки",
    resource: "setting",
    preload: [],
  }
};


export const FORM_CONFIG = {
  main: {
    name: { label: "Наименование заявки", type: "text", required: true },
    department_id: { label: "Департамент", type: "select", required: true },
    otdel_id: { label: "Отдел", type: "select", required: true },
    status_id: { label: "Статус", type: "select", required: true },
    priority_id: { label: "Приоритет", type: "select", required: true },
    duration: { label: "Срок", type: "text", required: true },
    branch_id: { label: "Филиал", type: "select", required: true },
    office_id: { label: "Офис ЦБО", type: "select", required: true },
    equipment_id: { label: "Оборудование", type: "select", required: true },
    executor_id: { label: "Исполнитель", type: "select", required: true },
    address: { label: "Адрес", type: "text", required: false },
    comment: { label: "Комментарий", type: "textarea", required: false },
  },
  order: {
    name: { label: "Наименование заявки", type: "text", required: true, min: 5 },
    department_id: { label: "Департамент", type: "select", required: true },
    otdel_id: { label: "Отдел", type: "select", required: false },
    status_id: { label: "Статус", type: "select", required: true },
    priority_id: { label: "Приоритет", type: "select", required: false },
    duration: { label: "Срок", type: "text", required: false },
    branch_id: { label: "Филиал", type: "select", required: false },
    office_id: { label: "Офис ЦБО", type: "select", required: false },
    equipment_id: { label: "Оборудование", type: "select", required: false },
    executor_id: { label: "Исполнитель", type: "select", required: false },
    address: { label: "Адрес", type: "text", required: true, min: 5 },
    comment: { label: "Комментарий", type: "textarea", required: false, min: 3 },
  },
  user: {
    fio: { label: "Имя", type: "text", required: true },
    department_id: { label: "Департамент", type: "select", required: true },
    otdel_id: { label: "Отдел", type: "select", required: false },
    branch_id: { label: "Филиал", type: "select", required: true },
    office_id: { label: "Офис ЦБО", type: "select", required: false },
    login: { label: "Логин", type: "text", required: false },
    phone_number: { label: "Телефон", type: "text", required: true },
    email: { label: "E-mail", type: "email", required: true },
    role_id: { label: "Роль", type: "select", required: true },
    photo: { label: "Фото", type: "file", required: false },
    position: { label: "Должность", type: "text", required: false },
  },
  status: {
    name: { label: "Наименование", type: "text", required: true },
    icon_big: { label: "Иконка (большая)", type: "file", required: false },
    icon_small: { label: "Иконка (маленькая)", type: "file", required: false },
    type: { label: "Тип", type: "number", required: true },
  },
  priority: {
    name: { label: "Наименование", type: "text", required: true },
    icon_big: { label: "Иконка (большая)", type: "file", required: false },
    icon_small: { label: "Иконка (маленькая)", type: "file", required: false },
    rate: { label: "Тип", type: "number", required: true },
  },
  department: {
    name: { label: "Наименование", type: "text", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  otdel: {
    name: { label: "Наименование", type: "text", required: true },
    department_id: { label: "Департамент", type: "select", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  branch: {
    name: { label: "Наименование", type: "text", required: true },
    address: { label: "Адрес", type: "text", required: false },
    open_date: { label: "Дата открытия", type: "date", required: false },
    email: { label: "Почтовый адрес", type: "email", required: false },
    phone_number: { label: "Телефон", type: "text", required: false },
    email_index: { label: "Почтовый индекс", type: "text", required: false },
    short_name: { label: "Короткое наименование", type: "text", required: false },
    status_id: { label: "Статус", type: "select", required: true },
  },
  office: {
    name: { label: "Наименование", type: "text", required: true },
    address: { label: "Адрес", type: "text", required: false },
    open_date: { label: "Дата открытия", type: "date", required: false },
    branch_id: { label: "Филиал", type: "select", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  role: {
    name: { label: "Наименование", type: "text", required: true },
    description: { label: "Описание", type: "textarea", required: false },
    permissions: { label: "Привелигия", type: "multiselect", required: true },
  },
  permission: {
    name: { label: "Наименование", type: "text", required: true },
    description: { label: "Описание", type: "textarea", required: false },
  },
  equipment_type: {
    name: { label: "Наименование", type: "text", required: true },
  },
  equipment: {
      name: { label: "Номер оборудования", type: "text", required: true },
      branch_id: { label: "Филиал", type: "select", required: true },
      office_id: { label: "Офис ЦБО", type: "select", required: true },
      address: { label: "Адрес оборудования", type: "text", required: false },
      equipment_type_id: { label: "Тип оборудования", type: "select", required: true },
      status_id: { label: "Статус", type: "select", required: true },
  },
};


export const DEPENDANT_FIELDS = {
  desc: {
    department_id: ["otdel_id"],
    branch_id: ["office_id"],
    office_id: ["equipment_id"],
    equipment_type: ["equipment_id"]
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
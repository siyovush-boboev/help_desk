export const TABLE_PAGES_CONFIG = {
  main: {
    singular: "Главная",
    plural: "Главная",
    resource: "main",
    preload: ["department", "otdel", "status", "priority", "branch", "office", "equipment_type", "user"],
    columns: {
      "№": null,
      "Наименование": "Наименование",
      "Открыто": "Открыто",
      "Закрыто": "Закрыто",
      "Всего": null
    }
  },
  order: {
    singular: "Заявка",
    plural: "Заявки",
    resource: "order",
    preload: ["department", "otdel", "status", "priority", "branch", "office", "equipment_type", "user"],
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
      "CHECKMARK": null,
      "Имя": "fio",
      "Департамент": "department_id",
      "Отдел": "otdel_id",
      "Роль": "role_id",
      "Телефон": "phoneNumber",
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
      "Иконка": "icon",
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
      "Иконка": "icon",
      "Наименование": "name",
      "Тип": "rate",
      "Действия": null
    }
  },
  department: {
    singular: "Департамент",
    plural: "Департаменты",
    resource: "department",
    preload: [],
    columns: {
      "№": null,
      "Наименование": "name",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]}
    ]
  },
  otdel: {
    singular: "Отдел",
    plural: "Отделы",
    resource: "otdel",
    preload: ["department"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Департамент": "department_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "department_id", label: "Департамент"},
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]}
    ]
  },
  branch: {
    singular: "Филиал",
    plural: "Филиалы",
    resource: "branch",
    preload: [],
    columns: {
      "№": null,
      "Наименование": "name",
      "Адрес": "address",
      "Дата открытия": "openDate",
      "Почтовый адресс": "email",
      "Телефон": "phoneNumber",
      "Почтовый индекс": "email_index",
      "Короткое наименование": "shortName",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]},
    ]
  },
  office: {
    singular: "Офис ЦБО",
    plural: "Офисы ЦБО",
    resource: "office",
    preload: ["branch", "department"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Адрес": "address",
      "Дата открытия": "openDate",
      "Филиал": "branch_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "branch_id", label: "Филиал"},
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]}
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
    },
    filters: [
      {id: "permission_id", label: "Привелигия"}
    ]
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
    singular: "Оборудование",
    plural: "Оборудования",
    resource: "equipment_type",
    preload: [],
    columns: {
      "№": null,
      "Наименование": "name",
      "Действия": null
    }
  },
  atm: {
    singular: "Банкомат",
    plural: "Банкоматы",
    resource: "atm",
    preload: ["branch", "office", "equipment_type"],
    columns: {
      "№": null,
      "Номер банкомата": "name",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Адрес банкомата": "address",
      "Оборудование": "type_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "type_id", label: "Оборудование"},
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"},
    ]
  },
  terminal: {
    singular: "Терминал",
    plural: "Терминалы",
    resource: "terminal",
    preload: ["branch", "office", "equipment_type"],
    columns: {
      "№": null,
      "Номер терминала": "name",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Адрес терминала": "address",
      "Оборудование": "type_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "type_id", label: "Оборудование"},
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"},
    ]
  },
  pos: {
    singular: "POS-терминал",
    plural: "POS-терминалы",
    resource: "pos",
    preload: ["branch", "office", "equipment_type"],
    columns: {
      "№": null,
      "Номер POS-терминала": "name",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Адрес POS-терминала": "address",
      "Оборудование": "type_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "type_id", label: "Оборудование"},
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]},
      {id: "branch_id", label: "Филиал"},
      {id: "office_id", label: "Офис ЦБО"},
    ]
  },
  coeo: {
    singular: "ЦО+ЭО",
    plural: "ЦО+ЭО",
    resource: "coeo",
    preload: ["branch", "office", "equipment_type"],
    columns: {
      "№": null,
      "Номер банкомата": "name",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Адрес банкомата": "address",
      "Оборудование": "type_id",
      "Статус": "status_id",
      "Действия": null
    },
    filters: [
      {id: "type_id", label: "Оборудование"},
      {id: "status_id", label: "Статус", options: ["Активный", "Неактивный"]},
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
    duration: { label: "Срок", type: "datetime-local", required: true },
    branch_id: { label: "Филиал", type: "select", required: true },
    office_id: { label: "Офис ЦБО", type: "select", required: true },
    equipment_id: { label: "Оборудование", type: "select", required: true },
    user_id: { label: "Исполнитель", type: "select", required: true },
    address: { label: "Адрес", type: "text", required: false },
    comment: { label: "Комментарий", type: "textarea", required: false },
  },
  order: {
    name: { label: "Наименование заявки", type: "text", required: true },
    department_id: { label: "Департамент", type: "select", required: true },
    otdel_id: { label: "Отдел", type: "select", required: true },
    status_id: { label: "Статус", type: "select", required: true },
    priority_id: { label: "Приоритет", type: "select", required: true },
    duration: { label: "Срок", type: "datetime-local", required: true },
    branch_id: { label: "Филиал", type: "select", required: true },
    office_id: { label: "Офис ЦБО", type: "select", required: true },
    equipment_id: { label: "Оборудование", type: "select", required: true },
    user_id: { label: "Исполнитель", type: "select", required: true },
    address: { label: "Адрес", type: "text", required: false },
    comment: { label: "Комментарий", type: "textarea", required: false },
  },
  user: {
    fio: { label: "Имя", type: "text", required: true },
    department_id: { label: "Департамент", type: "select", required: true },
    otdel_id: { label: "Отдел", type: "select", required: true },
    branch_id: { label: "Филиал", type: "select", required: true },
    office_id: { label: "Офис ЦБО", type: "select", required: true },
    phoneNumber: { label: "Телефон", type: "text", required: false },
    email: { label: "E-mail", type: "email", required: true },
    role_id: { label: "Роль", type: "select", required: true },
    photo: { label: "Фото", type: "file", required: false },
    position: { label: "Должность", type: "text", required: false },
  },
  status: {
    name: { label: "Наименование", type: "text", required: true },
    icon: { label: "Иконка", type: "file", required: false },
    type: { label: "Тип", type: "number", required: true },
  },
  priority: {
    name: { label: "Наименование", type: "text", required: true },
    icon: { label: "Иконка", type: "file", required: false },
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
    openDate: { label: "Дата открытия", type: "date", required: false },
    email: { label: "Почтовый адрес", type: "email", required: false },
    phoneNumber: { label: "Телефон", type: "text", required: false },
    email_index: { label: "Почтовый индекс", type: "text", required: false },
    shortName: { label: "Короткое наименование", type: "text", required: false },
    status_id: { label: "Статус", type: "select", required: true },
  },
  office: {
    name: { label: "Наименование", type: "text", required: true },
    address: { label: "Адрес", type: "text", required: false },
    openDate: { label: "Дата открытия", type: "date", required: false },
    branch_id: { label: "Филиал", type: "select", required: true },
    status_id: { label: "Статус", type: "select", required: true },
  },
  role: {
    name: { label: "Наименование", type: "text", required: true },
    description: { label: "Описание", type: "textarea", required: false },
    permission: { label: "Привелигия", type: "multiselect", required: true },
  },
  permission: {
    name: { label: "Наименование", type: "text", required: true },
    description: { label: "Описание", type: "textarea", required: false },
  },
  equipment_type: {
    name: { label: "Наименование", type: "text", required: true },
  },
  atm: {
      name: { label: "Номер банкомата", type: "text", required: true },
      branch_id: { label: "Филиал", type: "select", required: true },
      office_id: { label: "Офис ЦБО", type: "select", required: true },
      address: { label: "Адрес банкомата", type: "text", required: false },
      type_id: { label: "Оборудование", type: "select", required: true },
      status_id: { label: "Статус", type: "select", required: true },
  },
  terminal: {
      name: { label: "Номер терминала", type: "text", required: true },
      branch_id: { label: "Филиал", type: "select", required: true },
      office_id: { label: "Офис ЦБО", type: "select", required: true },
      address: { label: "Адрес терминала", type: "text", required: false },
      type_id: { label: "Оборудование", type: "select", required: true },
      status_id: { label: "Статус", type: "select", required: true },
  },
  pos: {
      name: { label: "Номер POS-терминала", type: "text", required: true },
      branch_id: { label: "Филиал", type: "select", required: true },
      office_id: { label: "Офис ЦБО", type: "select", required: true },
      address: { label: "Адрес POS-терминала", type: "text", required: false },
      type_id: { label: "Оборудование", type: "select", required: true },
      status_id: { label: "Статус", type: "select", required: true },
    },
  coeo: {
      name: { label: "Номер терминала", type: "text", required: true },
      branch_id: { label: "Филиал", type: "select", required: true },
      office_id: { label: "Офис ЦБО", type: "select", required: true },
      address: { label: "Адрес терминала", type: "text", required: false },
      type_id: { label: "Оборудование", type: "select", required: true },
      status_id: { label: "Статус", type: "select", required: true },
  },
};

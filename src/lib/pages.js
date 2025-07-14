export const API_RESOURCES = {
  main: "/main",
  order: "/order",
  user: "/user",
  status: "/status",
  priority: "/priority",
  department: "/department",
  otdel: "/otdel",
  branch: "/branch",
  office: "/office",
  role: "/role",
  permission: "/permission",
  equipment_type: "/equipment_type",
  atm: "/atm",
  terminal: "/terminal",
  pos: "/pos-terminal",
  coeo: "/coeo",
};


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
      "Всего": ""
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
      "Исполнитель": "",
      "Срок": "duration"
    }
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
    }
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
    }
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
    }
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
      "Почтовый индекс": "mailing_index",
      "Короткое наименование": "shortName",
      "Статус": "status_id",
      "Действия": null
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  }
};

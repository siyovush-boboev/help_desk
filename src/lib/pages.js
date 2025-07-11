export const API_RESOURCES = {
  main: "/main",
  orders: "/order",
  users: "/user",
  statuses: "/status",
  priorities: "/priority",
  departments: "/department",
  otdels: "/otdel",
  branches: "/branch",
  offices: "/office",
  roles: "/role",
  permissions: "/permission",
  equipmentTypes: "/equipment_type",
  atm: "/equipment?equipment_type=1",
  terminals: "/equipment?equipment_type=2",
  pos: "/equipment?equipment_type=3",
  coeo: "/equipment?equipment_type=4",
};


export const TABLE_PAGES_CONFIG = {
  main: {
    singular: "Главная",
    plural: "Главная",
    resource: "main",
    preload: ["departments", "otdels", "statuses", "priorities", "branches", "offices", "equipmentTypes", "users"],
    columns: {
      "№": null,
      "Наименование": "Наименование",
      "Открыто": "Открыто",
      "Закрыто": "Закрыто",
      "Всего": ""
    }
  },
  orders: {
    singular: "Заявка",
    plural: "Заявки",
    resource: "orders",
    preload: ["departments", "otdels", "statuses", "priorities", "branches", "offices", "equipmentTypes", "users"],
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
  users: {
    singular: "Пользователь",
    plural: "Пользователи",
    resource: "users",
    preload: ["departments", "otdels", "branches", "offices", "roles"],
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
  statuses: {
    singular: "Статус",
    plural: "Статусы",
    resource: "statuses",
    preload: [],
    columns: {
      "№": null,
      "Иконка": "icon",
      "Наименование": "name",
      "Тип": "type",
      "Действия": null
    }
  },
  priorities: {
    singular: "Приоритет",
    plural: "Приоритеты",
    resource: "priorities",
    preload: [],
    columns: {
      "№": null,
      "Иконка": "icon",
      "Наименование": "name",
      "Тип": "rate",
      "Действия": null
    }
  },
  departments: {
    singular: "Департамент",
    plural: "Департаменты",
    resource: "departments",
    preload: [],
    columns: {
      "№": null,
      "Наименование": "name",
      "Статус": null,
      "Действия": null
    }
  },
  otdels: {
    singular: "Отдел",
    plural: "Отделы",
    resource: "otdels",
    preload: ["departments"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Департамент": "department_id",
      "Статус": null,
      "Действия": null
    }
  },
  branches: {
    singular: "Филиал",
    plural: "Филиалы",
    resource: "branches",
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
      "Статус": null,
      "Действия": null
    }
  },
  offices: {
    singular: "Офис ЦБО",
    plural: "Офисы ЦБО",
    resource: "offices",
    preload: ["branches", "departments"],
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
  roles: {
    singular: "Роль",
    plural: "Роли",
    resource: "roles",
    preload: ["permissions"],
    columns: {
      "№": null,
      "Наименование": "name",
      "Описание": "description",
      "Действия": null
    }
  },
  permissions: {
    singular: "Привелигия",
    plural: "Привелигии",
    resource: "permissions",
    preload: [],
    columns: {
      "№": null,
      "Наименование": "name",
      "Описание": "description",
      "Действия": null
    }
  },
  equipmentTypes: {
    singular: "Оборудование",
    plural: "Оборудования",
    resource: "equipmentTypes",
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
    resource: "equipment",
    preload: ["branches", "offices", "equipmentTypes"],
    columns: {
      "№": null,
      "Номер банкомата": "name",
      "Филиал": "branch_id",
      "Офис ЦБО": "office_id",
      "Адрес банкомата": "address",
      "Оборудование": "type_id",
      "Статус": null,
      "Действия": null
    }
  },
  terminals: {
    singular: "Терминал",
    plural: "Терминалы",
    resource: "equipment",
    preload: ["branches", "offices", "equipmentTypes"],
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
    resource: "equipment",
    preload: ["branches", "offices", "equipmentTypes"],
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
    resource: "equipment",
    preload: ["branches", "offices", "equipmentTypes"],
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

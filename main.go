package main

import (
	"html/template"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func loadTemplates(pattern string) *template.Template {
	tmpl := template.New("")

	_ = filepath.Walk(pattern, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && filepath.Ext(path) == ".html" {
			_, err = tmpl.ParseFiles(path)
			if err != nil {
				panic(err)
			}
		}
		return nil
	})

	return tmpl
}

func main() {
	r := gin.Default()

	// Load all templates from templates/ recursively
	tmpl := loadTemplates("templates")
	r.SetHTMLTemplate(tmpl)

	// Serve static files
	r.Static("/assets", "./assets")

	// Routes
	r.GET("/login", func(c *gin.Context) {
		c.HTML(http.StatusOK, "login.html", nil)
	})

	r.GET("/admin", func(c *gin.Context) {
		c.HTML(http.StatusOK, "admin-main.html", nil)
	})

	r.GET("/user", func(c *gin.Context) {
		c.HTML(http.StatusOK, "user-main.html", nil)
	})

	r.GET("/executor", func(c *gin.Context) {
		c.HTML(http.StatusOK, "executor-main.html", nil)
	})

	r.GET("/auditor", func(c *gin.Context) {
		c.HTML(http.StatusOK, "auditor-main.html", nil)
	})

	r.POST("/login", func(c *gin.Context) {
		email := c.PostForm("login")
		password := c.PostForm("password")

		if email != "" && password != "" {
			// pretend we logged in successfully
			if email[:5] == "admin" {
				c.Redirect(http.StatusFound, "/admin")
			}
			if email[:4] == "user" {
				c.Redirect(http.StatusFound, "/user")
			}
			if email[:8] == "executor" {
				c.Redirect(http.StatusFound, "/executor")
			}
			if email[:7] == "auditor" {
				c.Redirect(http.StatusFound, "/auditor")
			}
			return
		}

		// if sum's wrong, reload login
		c.HTML(http.StatusUnauthorized, "login.html", gin.H{
			"error": "Неверный логин или пароль",
		})
	})

	// api/main/
	r.GET("/api/v1/main", func(c *gin.Context) {
		data := []gin.H{
			{"Наименование": "Отдел IT", "Открыто": 5, "Закрыто": 2},
			{"Наименование": "Отдел кадров", "Открыто": 3, "Закрыто": 1},
			{"Наименование": "Финансовый отдел", "Открыто": 7, "Закрыто": 4},
			{"Наименование": "Юридический отдел", "Открыто": 2, "Закрыто": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/order", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1023, "name": "Ошибка входа в систему", "department_id": 1, "otdel_id": 1, "priority_id": 3, "status_id": 1, "branch_id": 1, "office_id": 1, "equipment_id": 1, "user_id": 1, "duration": "2024-06-01T09:15:00Z", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "created_at": "2024-06-01T08:00:00Z"},
			{"id": 2045, "name": "Не работает принтер", "department_id": 2, "otdel_id": 2, "priority_id": 1, "status_id": 3, "branch_id": 2, "office_id": 2, "equipment_id": 2, "user_id": 2, "duration": "2024-06-02T10:30:00Z", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "created_at": "2024-06-02T09:00:00Z"},
			{"id": 3098, "name": "Запрос на доступ", "department_id": 3, "otdel_id": 3, "priority_id": 4, "status_id": 2, "branch_id": 3, "office_id": 3, "equipment_id": 3, "user_id": 3, "duration": "2024-06-03T14:45:00Z", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "created_at": "2024-06-03T13:00:00Z"},
			{"id": 4120, "name": "Сброс пароля", "department_id": 4, "otdel_id": 4, "priority_id": 2, "status_id": 4, "branch_id": 4, "office_id": 4, "equipment_id": 4, "user_id": 4, "duration": "2024-06-04T08:20:00Z", "address": "ш. Душанбе, кӯч. Сино 89", "created_at": "2024-06-04T07:00:00Z"},
			{"id": 5234, "name": "Проблема с интернетом", "department_id": 1, "otdel_id": 1, "priority_id": 1, "status_id": 1, "branch_id": 1, "office_id": 1, "equipment_id": 4, "user_id": 5, "duration": "2024-06-05T13:10:00Z", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "created_at": "2024-06-05T12:00:00Z"},
			{"id": 6345, "name": "Ошибка программного обеспечения", "department_id": 3, "otdel_id": 3, "priority_id": 3, "status_id": 2, "branch_id": 3, "office_id": 3, "equipment_id": 3, "user_id": 6, "duration": "2024-06-06T15:25:00Z", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "created_at": "2024-06-06T14:00:00Z"},
			{"id": 7456, "name": "Установка драйвера", "department_id": 2, "otdel_id": 2, "priority_id": 2, "status_id": 3, "branch_id": 2, "office_id": 2, "equipment_id": 2, "user_id": 2, "duration": "2024-06-07T11:40:00Z", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "created_at": "2024-06-07T10:00:00Z"},
			{"id": 8567, "name": "Восстановление доступа к почте", "department_id": 1, "otdel_id": 1, "priority_id": 3, "status_id": 3, "branch_id": 1, "office_id": 1, "equipment_id": 2, "user_id": 1, "duration": "2024-06-08T09:55:00Z", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "created_at": "2024-06-08T08:30:00Z"},
			{"id": 9678, "name": "Сбой сервера", "department_id": 3, "otdel_id": 3, "priority_id": 4, "status_id": 3, "branch_id": 3, "office_id": 3, "equipment_id": 1, "user_id": 3, "duration": "2024-06-09T17:05:00Z", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "created_at": "2024-06-09T16:00:00Z"},
			{"id": 10789, "name": "Замена мыши", "department_id": 2, "otdel_id": 2, "priority_id": 1, "status_id": 3, "branch_id": 2, "office_id": 2, "equipment_id": 2, "user_id": 2, "duration": "2024-06-10T08:10:00Z", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "created_at": "2024-06-10T07:00:00Z"},
			{"id": 11890, "name": "Обновление антивируса", "department_id": 1, "otdel_id": 1, "priority_id": 2, "status_id": 3, "branch_id": 1, "office_id": 1, "equipment_id": 3, "user_id": 1, "duration": "2024-06-11T13:50:00Z", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "created_at": "2024-06-11T12:30:00Z"},
			{"id": 12901, "name": "Проблема с VPN", "department_id": 3, "otdel_id": 3, "priority_id": 3, "status_id": 3, "branch_id": 3, "office_id": 3, "equipment_id": 4, "user_id": 3, "duration": "2024-06-12T16:40:00Z", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "created_at": "2024-06-12T15:00:00Z"},
		}
		pagination := map[string]interface{}{
			"currentPage": 1,
			"pageSize":    10,
			"totalPages":  2,
			"totalItems":  12,
			"hasNextPage": true,
			"hasPrevPage": true,
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
			"pagination":  pagination,
		})
	})

	r.GET("/api/v1/user", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "fio": "Рахимов Алишер Саидович", "email": "alisher.rahimov@arvand.tj", "phoneNumber": "+992901234567", "role_id": 2, "branch_id": 1, "department_id": 1, "office_id": 1, "otdel_id": 1, "position": "Начальник отдела IT"},
			{"id": 2, "fio": "Саидов Фаррух Махмадович", "email": "farrukh.saidov@arvand.tj", "phoneNumber": "+992902345678", "role_id": 3, "branch_id": 2, "department_id": 2, "office_id": 2, "otdel_id": 2, "position": "Специалист по кадрам"},
			{"id": 3, "fio": "Каримова Мехрубон Шариповна", "email": "mehrubon.karimova@arvand.tj", "phoneNumber": "+992933456789", "role_id": 5, "branch_id": 3, "department_id": 3, "office_id": 3, "otdel_id": 3, "position": "Исполнитель заявок"},
			{"id": 4, "fio": "Назарова Шахноза Рустамовна", "email": "shahnoza.nazarova@arvand.tj", "phoneNumber": "+992944567890", "role_id": 4, "branch_id": 4, "department_id": 4, "office_id": 4, "otdel_id": 4, "position": "Аудитор"},
			{"id": 5, "fio": "Исмоилова Малика Давлатовна", "email": "malika.ismoilova@arvand.tj", "phoneNumber": "+992955678901", "role_id": 1, "branch_id": 1, "department_id": 1, "office_id": 1, "otdel_id": 1, "position": "Супер админ"},
			{"id": 6, "fio": "Мирзоев Далер Фирузович", "email": "daler.mirzoev@arvand.tj", "phoneNumber": "+992966789012", "role_id": 5, "branch_id": 3, "department_id": 3, "office_id": 3, "otdel_id": 3, "position": "Исполнитель заявок"},
		}
		pagination := map[string]interface{}{
			"currentPage": 1,
			"pageSize":    10,
			"totalPages":  1,
			"totalItems":  6,
			"hasNextPage": false,
			"hasPrevPage": false,
		}

		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
			"pagination":  pagination,
		})
	})

	r.GET("/api/v1/status", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "icon": "icon1", "name": "Открыто", "type": 1},
			{"id": 2, "icon": "icon2", "name": "В работе", "type": 1},
			{"id": 3, "icon": "icon3", "name": "Закрыто", "type": 2},
			{"id": 4, "icon": "icon4", "name": "Отменено", "type": 2},
			{"id": 5, "icon": "icon5", "name": "В ожидании", "type": 3},
			{"id": 6, "icon": "icon6", "name": "Одобрено", "type": 2},
			{"id": 7, "icon": "icon7", "name": "Отклонено", "type": 2},
			{"id": 8, "icon": "icon8", "name": "На удержании", "type": 3},
			{"id": 9, "icon": "icon9", "name": "Эскалировано", "type": 4},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/priority", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "icon": "icon-low", "name": "Низкий", "rate": 1},
			{"id": 2, "icon": "icon-medium", "name": "Средний", "rate": 2},
			{"id": 3, "icon": "icon-high", "name": "Высокий", "rate": 3},
			{"id": 4, "icon": "icon-critical", "name": "Критический", "rate": 4},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/department", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Департамент информационных технологий", "status_id": 0},
			{"id": 2, "name": "Департамент кадров", "status_id": 1},
			{"id": 3, "name": "Департамент финансов", "status_id": 1},
			{"id": 4, "name": "Департамент юридических услуг", "status_id": 1},
			{"id": 5, "name": "Департамент обслуживания клиентов", "status_id": 1},
			{"id": 6, "name": "Департамент безопасности", "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/otdel", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Отдел IT", "status_id": 1, "department_id": 1},
			{"id": 2, "name": "Отдел кадров", "status_id": 1, "department_id": 2},
			{"id": 3, "name": "Финансовый отдел", "status_id": 1, "department_id": 3},
			{"id": 4, "name": "Юридический отдел", "status_id": 1, "department_id": 4},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/branch", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Филиали марказӣ", "shortName": "Марказӣ", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "phoneNumber": "+992 44 600 0001", "email": "central@arvand.tj", "mailing_index": "734003", "openDate": "2010-01-15", "status_id": 1},
			{"id": 2, "name": "Филиали Исмоили Сомонӣ", "shortName": "И. Сомонӣ", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "phoneNumber": "+992 44 600 0002", "email": "somoni@arvand.tj", "mailing_index": "734012", "openDate": "2012-03-10", "status_id": 1},
			{"id": 3, "name": "Филиали Фирдавсӣ", "shortName": "Фирдавсӣ", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "phoneNumber": "+992 44 600 0003", "email": "firdavsi@arvand.tj", "mailing_index": "734025", "openDate": "2013-06-25", "status_id": 1},
			{"id": 4, "name": "Филиали Сино", "shortName": "Сино", "address": "ш. Душанбе, кӯч. Сино 89", "phoneNumber": "+992 44 600 0004", "email": "sino@arvand.tj", "mailing_index": "734019", "openDate": "2014-09-05", "status_id": 1},
			{"id": 5, "name": "Филиали Шоҳмансур", "shortName": "Шоҳмансур", "address": "ш. Душанбе, кӯч. Шоҳмансур 12", "phoneNumber": "+992 44 600 0005", "email": "shohmansur@arvand.tj", "mailing_index": "734024", "openDate": "2015-11-20", "status_id": 1},
			{"id": 6, "name": "Филиали Вахдат", "shortName": "Вахдат", "address": "ш. Вахдат, кӯч. Истиқлол 34", "phoneNumber": "+992 44 600 0006", "email": "vahdat@arvand.tj", "mailing_index": "735500", "openDate": "2016-02-14", "status_id": 1},
			{"id": 7, "name": "Филиали Ҳисор", "shortName": "Ҳисор", "address": "ш. Ҳисор, кӯч. Наврӯз 56", "phoneNumber": "+992 44 600 0007", "email": "hisor@arvand.tj", "mailing_index": "735140", "openDate": "2017-04-18", "status_id": 1},
			{"id": 8, "name": "Филиали Турсунзода", "shortName": "Турсунзода", "address": "ш. Турсунзода, кӯч. Дӯстӣ 78", "phoneNumber": "+992 44 600 0008", "email": "tursunzoda@arvand.tj", "mailing_index": "735400", "openDate": "2018-07-22", "status_id": 1},
			{"id": 9, "name": "Филиали Бохтар", "shortName": "Бохтар", "address": "ш. Бохтар, кӯч. Садриддин Айнӣ 90", "phoneNumber": "+992 44 600 0009", "email": "bokhtar@arvand.tj", "mailing_index": "735140", "openDate": "2019-10-30", "status_id": 1},
			{"id": 10, "name": "Филиали Хуҷанд", "shortName": "Хуҷанд", "address": "ш. Хуҷанд, кӯч. Гагарин 21", "phoneNumber": "+992 44 600 0010", "email": "khujand@arvand.tj", "mailing_index": "735700", "openDate": "2020-12-12", "status_id": 1},
			{"id": 11, "name": "Филиали Кӯлоб", "shortName": "Кӯлоб", "address": "ш. Кӯлоб, кӯч. Борбад 11", "phoneNumber": "+992 44 600 0011", "email": "kulob@arvand.tj", "mailing_index": "736100", "openDate": "2021-08-08", "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/office", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "КБО Марказӣ", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "openDate": "2010-01-15", "branch_id": 1, "status_id": 1},
			{"id": 2, "name": "КБО Исмоили Сомонӣ", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "openDate": "2012-03-10", "branch_id": 2, "status_id": 1},
			{"id": 3, "name": "КБО Фирдавсӣ", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "openDate": "2013-06-25", "branch_id": 3, "status_id": 1},
			{"id": 4, "name": "КБО Сино", "address": "ш. Душанбе, кӯч. Сино 89", "openDate": "2014-09-05", "branch_id": 4, "status_id": 1},
			{"id": 5, "name": "КБО Шоҳмансур", "address": "ш. Душанбе, кӯч. Шоҳмансур 12", "openDate": "2015-11-20", "branch_id": 5, "status_id": 1},
			{"id": 6, "name": "КБО Вахдат", "address": "ш. Вахдат, кӯч. Истиқлол 34", "openDate": "2016-02-14", "branch_id": 6, "status_id": 1},
			{"id": 7, "name": "КБО Ҳисор", "address": "ш. Ҳисор, кӯч. Наврӯз 56", "openDate": "2017-04-18", "branch_id": 7, "status_id": 1},
			{"id": 8, "name": "КБО Турсунзода", "address": "ш. Турсунзода, кӯч. Дӯстӣ 78", "openDate": "2018-07-22", "branch_id": 8, "status_id": 1},
			{"id": 9, "name": "КБО Бохтар", "address": "ш. Бохтар, кӯч. Садриддин Айнӣ 90", "openDate": "2019-10-30", "branch_id": 9, "status_id": 1},
			{"id": 10, "name": "КБО Хуҷанд", "address": "ш. Хуҷанд, кӯч. Гагарин 21", "openDate": "2020-12-12", "branch_id": 10, "status_id": 1},
			{"id": 11, "name": "КБО Кӯлоб", "address": "ш. Кӯлоб, кӯч. Борбад 11", "openDate": "2021-08-08", "branch_id": 11, "status_id": 1},
			{"id": 12, "name": "КБО Рӯдакӣ", "address": "ш. Рӯдакӣ, кӯч. Сомон 15", "openDate": "2011-04-19", "branch_id": 12, "status_id": 1},
			{"id": 13, "name": "КБО Спитамен", "address": "ш. Спитамен, кӯч. Истиқлол 22", "openDate": "2013-07-23", "branch_id": 13, "status_id": 1},
			{"id": 14, "name": "КБО Панҷакент", "address": "ш. Панҷакент, кӯч. Рӯдакӣ 33", "openDate": "2015-10-11", "branch_id": 14, "status_id": 1},
			{"id": 15, "name": "КБО Истаравшан", "address": "ш. Истаравшан, кӯч. Фирдавсӣ 44", "openDate": "2017-03-17", "branch_id": 15, "status_id": 1},
			{"id": 16, "name": "КБО Файзобод", "address": "ш. Файзобод, кӯч. Наврӯз 55", "openDate": "2018-06-29", "branch_id": 16, "status_id": 1},
			{"id": 17, "name": "КБО Ёвон", "address": "ш. Ёвон, кӯч. Дӯстӣ 66", "openDate": "2019-09-14", "branch_id": 17, "status_id": 1},
			{"id": 18, "name": "КБО Данғара", "address": "ш. Данғара, кӯч. Истиқлол 77", "openDate": "2022-02-28", "branch_id": 18, "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/role", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "super admin", "description": "Полный доступ ко всем функциям и настройкам системы", "permission": []int{1, 2, 3, 4, 5, 6, 7, 8, 9}},
			{"id": 2, "name": "admin", "description": "Администрирование пользователей и основных настроек", "permission": []int{1, 2, 3, 4, 5, 6, 7, 8}},
			{"id": 3, "name": "user", "description": "Обычный пользователь системы", "permission": []int{1, 2}},
			{"id": 4, "name": "view_auditor", "description": "Аудитор с правом только просмотра", "permission": []int{1, 6}},
			{"id": 5, "name": "executor", "description": "Исполнитель заявок", "permission": []int{1, 3}},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/permission", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Просмотр заявок", "description": "Возможность просматривать все заявки в системе"},
			{"id": 2, "name": "Создание заявок", "description": "Возможность создавать новые заявки"},
			{"id": 3, "name": "Редактирование заявок", "description": "Возможность редактировать существующие заявки"},
			{"id": 4, "name": "Удаление заявок", "description": "Возможность удалять заявки"},
			{"id": 5, "name": "Управление пользователями", "description": "Управление учетными записями пользователей и их ролями"},
			{"id": 6, "name": "Просмотр отчетов", "description": "Просмотр аналитических и статистических отчетов"},
			{"id": 7, "name": "Экспорт данных", "description": "Экспортировать данные в различные форматы"},
			{"id": 8, "name": "Настройка справочников", "description": "Добавление и изменение справочной информации"},
			{"id": 9, "name": "Администрирование системы", "description": "Доступ к административным функциям и настройкам системы"},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/equipment_type", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Банкомат"},
			{"id": 2, "name": "Терминал"},
			{"id": 3, "name": "POS-Терминал"},
			{"id": 4, "name": "Цифровой офис"},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/equipment", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "ATM-123456", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "branch_id": 1, "office_id": 1, "type_id": 1, "status_id": 1},
			{"id": 2, "name": "ATM-234567", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "branch_id": 2, "office_id": 2, "type_id": 1, "status_id": 1},
			{"id": 3, "name": "ATM-345678", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "branch_id": 3, "office_id": 3, "type_id": 1, "status_id": 1},
			{"id": 4, "name": "ATM-456789", "address": "ш. Душанбе, кӯч. Сино 89", "branch_id": 4, "office_id": 4, "type_id": 1, "status_id": 1},
			{"id": 5, "name": "Terminal-1001", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "branch_id": 1, "office_id": 1, "type_id": 2, "status_id": 1},
			{"id": 6, "name": "Terminal-1002", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "branch_id": 2, "office_id": 2, "type_id": 2, "status_id": 1},
			{"id": 7, "name": "POS-2001", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "branch_id": 1, "office_id": 1, "type_id": 3, "status_id": 1},
			{"id": 8, "name": "POS-2002", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "branch_id": 2, "office_id": 2, "type_id": 3, "status_id": 1},
			{"id": 9, "name": "DigitalOffice-3001", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "branch_id": 1, "office_id": 1, "type_id": 4, "status_id": 1},
			{"id": 10, "name": "DigitalOffice-3002", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "branch_id": 2, "office_id": 2, "type_id": 4, "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.GET("/api/v1/user/1", func(c *gin.Context) {
		data := gin.H{
			"id":          1,
			"fio":         "lastname firstname middlename",
			"email":       "user1@arvand.tj",
			"phoneNumber": "+992 92 777 0000",

			"role_id":       1,
			"branch_id":     1,
			"department_id": 1,

			"office_id": 1,
			"otdel_id":  1,
			"position":  "Супер админ",
		}
		c.JSON(http.StatusOK, gin.H{
			"result":      data,
			"status_code": 200,
		})
	})

	r.Run(":8080")
}

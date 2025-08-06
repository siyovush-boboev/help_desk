package main

import (
	"fmt"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("supersecret_access_key")
var jwtRefreshKey = []byte("supersecret_refresh_key")

type Claims struct {
	UserID   string `json:"sub"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// Example permissions per role
var rolePermissions = map[string][]string{
	"admin": {"create_orders", "view_orders", "update_orders", "delete_orders",
		"create_users", "view_users", "update_users", "delete_users",
		"create_collections", "view_collections", "update_collections", "delete_collections",
		"create_roles", "view_roles", "update_roles", "delete_roles",
		"create_reports"},
	"user": {"create_order", "view_order", "update_order", "delete_order",
		"create_reports"},
	"auditor": {"view_order", "create_reports"},
}

// Generate JWT token helper
func generateToken(username, role string, expiresIn time.Duration) (string, error) {
	claims := &Claims{
		Username: username,
		Role:     role,
		UserID:   "1",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func DummyAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized, token missing"})
			c.Abort()
			return
		}
		// optionally: just let it pass without real token check
		c.Next()
	}
}

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

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid Authorization header"})
			c.Abort()
			fmt.Println("header shii")
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			fmt.Println("token invalid or exprd shii")
			return
		}

		claims, ok := token.Claims.(*Claims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			fmt.Println("claims invalid shii")
			return
		}

		if claims.ExpiresAt.Time.Before(time.Now()) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
			c.Abort()
			fmt.Println("token expired shii")
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("login", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func main() {
	r := gin.Default()
	// r.Use(CORSMiddleware())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	api.Use(AuthMiddleware())

	// api.Use(DummyAuthMiddleware())

	// Load all templates from templates/ recursively
	tmpl := loadTemplates("templates")
	r.SetHTMLTemplate(tmpl)

	// Serve static files
	r.Static("/assets", "./assets")

	// Routes
	r.GET("/login", func(c *gin.Context) {
		c.HTML(http.StatusOK, "login.html", nil)
	})

	r.POST("api/auth/login", func(c *gin.Context) {
		var creds struct {
			Login      string `json:"login"`
			Password   string `json:"password"`
			RememberMe bool   `json:"rememberMe"`
		}

		if err := c.BindJSON(&creds); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
			return
		}

		if creds.Login == "" || creds.Password == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing credentials"})
			return
		}

		// Dummy role detection
		var role string
		switch {
		case strings.HasPrefix(creds.Login, "admin"):
			role = "admin"
		case strings.HasPrefix(creds.Login, "user"):
			role = "user"
		case strings.HasPrefix(creds.Login, "auditor"):
			role = "auditor"
		default:
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid login"})
			return
		}

		// Get permissions
		perms, ok := rolePermissions[role]
		if !ok {
			perms = []string{}
		}

		// Create Access Token
		accessClaims := &Claims{
			Username: creds.Login,
			Role:     role,
			UserID:   "1",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Second)),
			},
		}
		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
		accessString, err := accessToken.SignedString(jwtKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create access token"})
			return
		}

		// 🧠 Here: decide refresh expiry based on rememberMe
		refreshDuration := 30 * 24 * time.Hour
		if !creds.RememberMe {
			refreshDuration = 30 * time.Minute
		}

		refreshClaims := &Claims{
			Username: creds.Login,
			Role:     role,
			UserID:   "1",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshDuration)),
			},
		}
		refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
		refreshString, err := refreshToken.SignedString(jwtRefreshKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create refresh token"})
			return
		}

		// 🍪 set cookie with correct MaxAge
		c.SetCookie(
			"refresh_token",
			refreshString,
			int(refreshDuration.Seconds()),
			"/",
			"",
			true, // Secure
			true, // HttpOnly
		)

		c.JSON(http.StatusOK, gin.H{
			"status": true,
			"body": gin.H{
				"access_token": accessString,
				"permissions":  perms,
				"user": gin.H{
					"id":      1,
					"role_id": 1,
				},
			},
			"message": "Авторизация прошла успешно",
		})
	})

	r.POST("api/auth/refresh", func(c *gin.Context) {
		rtCookie, err := c.Cookie("refresh_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No refresh token"})
			return
		}

		// Parse refresh token
		token, err := jwt.ParseWithClaims(rtCookie, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtRefreshKey, nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
			return
		}

		claims, ok := token.Claims.(*Claims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}

		// Generate new access token
		newAccessToken, err := generateToken(claims.Username, claims.Role, 10*time.Second)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status": true,
			"body": gin.H{
				"access_token": newAccessToken,
			},
			"message": "access token refreshed successfully",
		})
	})

	api.GET("/auth/me", func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
			return
		}

		// Replace this with your DB call
		user := gin.H{
			"id":            userID,
			"email":         "user@example.com",
			"phone_number":  "+992901234567",
			"fio":           "Lil Coder J",
			"role":          "user",
			"position":      "Junior Developer",
			"department_id": 1,
		}

		c.JSON(http.StatusOK, user)
	})

	// api/main/
	api.GET("/main", func(c *gin.Context) {
		data := []gin.H{
			{"Наименование": "Отдел IT", "Открыто": 5, "Закрыто": 2},
			{"Наименование": "Отдел кадров", "Открыто": 3, "Закрыто": 1},
			{"Наименование": "Финансовый отдел", "Открыто": 7, "Закрыто": 4},
			{"Наименование": "Юридический отдел", "Открыто": 2, "Закрыто": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/orders", func(c *gin.Context) {
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
			"limit":       10,
			"totalPages":  2,
			"totalItems":  12,
			"hasNextPage": true,
			"hasPrevPage": true,
		}
		c.JSON(http.StatusOK, gin.H{
			"body":       data,
			"status":     true,
			"pagination": pagination,
		})
	})

	api.GET("/users", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "fio": "Рахимов Алишер Саидович", "email": "alisher.rahimov@arvand.tj", "phone_number": "+992901234567", "role_id": 2, "branch_id": 1, "department_id": 1, "office_id": 1, "otdel_id": 1, "position": "Начальник отдела IT"},
			{"id": 2, "fio": "Саидов Фаррух Махмадович", "email": "farrukh.saidov@arvand.tj", "phone_number": "+992902345678", "role_id": 3, "branch_id": 2, "department_id": 2, "office_id": 2, "otdel_id": 2, "position": "Специалист по кадрам"},
			{"id": 3, "fio": "Каримова Мехрубон Шариповна", "email": "mehrubon.karimova@arvand.tj", "phone_number": "+992933456789", "role_id": 5, "branch_id": 3, "department_id": 3, "office_id": 3, "otdel_id": 3, "position": "Исполнитель заявок"},
			{"id": 4, "fio": "Назарова Шахноза Рустамовна", "email": "shahnoza.nazarova@arvand.tj", "phone_number": "+992944567890", "role_id": 4, "branch_id": 4, "department_id": 4, "office_id": 4, "otdel_id": 4, "position": "Аудитор"},
			{"id": 5, "fio": "Исмоилова Малика Давлатовна", "email": "malika.ismoilova@arvand.tj", "phone_number": "+992955678901", "role_id": 1, "branch_id": 1, "department_id": 1, "office_id": 1, "otdel_id": 1, "position": "Супер админ"},
			{"id": 6, "fio": "Мирзоев Далер Фирузович", "email": "daler.mirzoev@arvand.tj", "phone_number": "+992966789012", "role_id": 5, "branch_id": 3, "department_id": 3, "office_id": 3, "otdel_id": 3, "position": "Исполнитель заявок"},
		}
		pagination := map[string]interface{}{
			"currentPage": 1,
			"limit":       10,
			"totalPages":  1,
			"totalItems":  6,
			"hasNextPage": false,
			"hasPrevPage": false,
		}

		c.JSON(http.StatusOK, gin.H{
			"body":       data,
			"status":     true,
			"pagination": pagination,
		})
	})

	api.GET("/statuses", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/priorities", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "icon": "icon-low", "name": "Низкий", "rate": 1},
			{"id": 2, "icon": "icon-medium", "name": "Средний", "rate": 2},
			{"id": 3, "icon": "icon-high", "name": "Высокий", "rate": 3},
			{"id": 4, "icon": "icon-critical", "name": "Критический", "rate": 4},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/departments", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Департамент информационных технологий", "status_id": 0},
			{"id": 2, "name": "Департамент кадров", "status_id": 1},
			{"id": 3, "name": "Департамент финансов", "status_id": 1},
			{"id": 4, "name": "Департамент юридических услуг", "status_id": 1},
			{"id": 5, "name": "Департамент обслуживания клиентов", "status_id": 1},
			{"id": 6, "name": "Департамент безопасности", "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/otdels", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Отдел IT", "status_id": 1, "department_id": 1},
			{"id": 2, "name": "Отдел кадров", "status_id": 1, "department_id": 2},
			{"id": 3, "name": "Финансовый отдел", "status_id": 1, "department_id": 3},
			{"id": 4, "name": "Юридический отдел", "status_id": 1, "department_id": 4},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/branches", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Филиали марказӣ", "shortName": "Марказӣ", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "phone_number": "+992 44 600 0001", "email": "central@arvand.tj", "email_index": "734003", "open_date": "2010-01-15", "status_id": 1},
			{"id": 2, "name": "Филиали Исмоили Сомонӣ", "shortName": "И. Сомонӣ", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "phone_number": "+992 44 600 0002", "email": "somoni@arvand.tj", "email_index": "734012", "open_date": "2012-03-10", "status_id": 1},
			{"id": 3, "name": "Филиали Фирдавсӣ", "shortName": "Фирдавсӣ", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "phone_number": "+992 44 600 0003", "email": "firdavsi@arvand.tj", "email_index": "734025", "open_date": "2013-06-25", "status_id": 1},
			{"id": 4, "name": "Филиали Сино", "shortName": "Сино", "address": "ш. Душанбе, кӯч. Сино 89", "phone_number": "+992 44 600 0004", "email": "sino@arvand.tj", "email_index": "734019", "open_date": "2014-09-05", "status_id": 1},
			{"id": 5, "name": "Филиали Шоҳмансур", "shortName": "Шоҳмансур", "address": "ш. Душанбе, кӯч. Шоҳмансур 12", "phone_number": "+992 44 600 0005", "email": "shohmansur@arvand.tj", "email_index": "734024", "open_date": "2015-11-20", "status_id": 1},
			{"id": 6, "name": "Филиали Вахдат", "shortName": "Вахдат", "address": "ш. Вахдат, кӯч. Истиқлол 34", "phone_number": "+992 44 600 0006", "email": "vahdat@arvand.tj", "email_index": "735500", "open_date": "2016-02-14", "status_id": 1},
			{"id": 7, "name": "Филиали Ҳисор", "shortName": "Ҳисор", "address": "ш. Ҳисор, кӯч. Наврӯз 56", "phone_number": "+992 44 600 0007", "email": "hisor@arvand.tj", "email_index": "735140", "open_date": "2017-04-18", "status_id": 1},
			{"id": 8, "name": "Филиали Турсунзода", "shortName": "Турсунзода", "address": "ш. Турсунзода, кӯч. Дӯстӣ 78", "phone_number": "+992 44 600 0008", "email": "tursunzoda@arvand.tj", "email_index": "735400", "open_date": "2018-07-22", "status_id": 1},
			{"id": 9, "name": "Филиали Бохтар", "shortName": "Бохтар", "address": "ш. Бохтар, кӯч. Садриддин Айнӣ 90", "phone_number": "+992 44 600 0009", "email": "bokhtar@arvand.tj", "email_index": "735140", "open_date": "2019-10-30", "status_id": 1},
			{"id": 10, "name": "Филиали Хуҷанд", "shortName": "Хуҷанд", "address": "ш. Хуҷанд, кӯч. Гагарин 21", "phone_number": "+992 44 600 0010", "email": "khujand@arvand.tj", "email_index": "735700", "open_date": "2020-12-12", "status_id": 1},
			{"id": 11, "name": "Филиали Кӯлоб", "shortName": "Кӯлоб", "address": "ш. Кӯлоб, кӯч. Борбад 11", "phone_number": "+992 44 600 0011", "email": "kulob@arvand.tj", "email_index": "736100", "open_date": "2021-08-08", "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/offices", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "КБО Марказӣ", "address": "ш. Душанбе, кӯч. Рӯдакӣ 123", "open_date": "2010-01-15", "branch_id": 1, "status_id": 1},
			{"id": 2, "name": "КБО Исмоили Сомонӣ", "address": "ш. Душанбе, кӯч. Исмоили Сомонӣ 45", "open_date": "2012-03-10", "branch_id": 2, "status_id": 1},
			{"id": 3, "name": "КБО Фирдавсӣ", "address": "ш. Душанбе, кӯч. Фирдавсӣ 67", "open_date": "2013-06-25", "branch_id": 3, "status_id": 1},
			{"id": 4, "name": "КБО Сино", "address": "ш. Душанбе, кӯч. Сино 89", "open_date": "2014-09-05", "branch_id": 4, "status_id": 1},
			{"id": 5, "name": "КБО Шоҳмансур", "address": "ш. Душанбе, кӯч. Шоҳмансур 12", "open_date": "2015-11-20", "branch_id": 5, "status_id": 1},
			{"id": 6, "name": "КБО Вахдат", "address": "ш. Вахдат, кӯч. Истиқлол 34", "open_date": "2016-02-14", "branch_id": 6, "status_id": 1},
			{"id": 7, "name": "КБО Ҳисор", "address": "ш. Ҳисор, кӯч. Наврӯз 56", "open_date": "2017-04-18", "branch_id": 7, "status_id": 1},
			{"id": 8, "name": "КБО Турсунзода", "address": "ш. Турсунзода, кӯч. Дӯстӣ 78", "open_date": "2018-07-22", "branch_id": 8, "status_id": 1},
			{"id": 9, "name": "КБО Бохтар", "address": "ш. Бохтар, кӯч. Садриддин Айнӣ 90", "open_date": "2019-10-30", "branch_id": 9, "status_id": 1},
			{"id": 10, "name": "КБО Хуҷанд", "address": "ш. Хуҷанд, кӯч. Гагарин 21", "open_date": "2020-12-12", "branch_id": 10, "status_id": 1},
			{"id": 11, "name": "КБО Кӯлоб", "address": "ш. Кӯлоб, кӯч. Борбад 11", "open_date": "2021-08-08", "branch_id": 11, "status_id": 1},
			{"id": 12, "name": "КБО Рӯдакӣ", "address": "ш. Рӯдакӣ, кӯч. Сомон 15", "open_date": "2011-04-19", "branch_id": 5, "status_id": 1},
			{"id": 13, "name": "КБО Спитамен", "address": "ш. Спитамен, кӯч. Истиқлол 22", "open_date": "2013-07-23", "branch_id": 1, "status_id": 1},
			{"id": 14, "name": "КБО Панҷакент", "address": "ш. Панҷакент, кӯч. Рӯдакӣ 33", "open_date": "2015-10-11", "branch_id": 7, "status_id": 1},
			{"id": 15, "name": "КБО Истаравшан", "address": "ш. Истаравшан, кӯч. Фирдавсӣ 44", "open_date": "2017-03-17", "branch_id": 2, "status_id": 1},
			{"id": 16, "name": "КБО Файзобод", "address": "ш. Файзобод, кӯч. Наврӯз 55", "open_date": "2018-06-29", "branch_id": 6, "status_id": 1},
			{"id": 17, "name": "КБО Ёвон", "address": "ш. Ёвон, кӯч. Дӯстӣ 66", "open_date": "2019-09-14", "branch_id": 9, "status_id": 1},
			{"id": 18, "name": "КБО Данғара", "address": "ш. Данғара, кӯч. Истиқлол 77", "open_date": "2022-02-28", "branch_id": 3, "status_id": 1},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/roles", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "super admin", "description": "Полный доступ ко всем функциям и настройкам системы", "permission": []int{1, 2, 3, 4, 5, 6, 7, 8, 9}},
			{"id": 2, "name": "admin", "description": "Администрирование пользователей и основных настроек", "permission": []int{1, 2, 3, 4, 5, 6, 7, 8}},
			{"id": 3, "name": "user", "description": "Обычный пользователь системы", "permission": []int{1, 2}},
			{"id": 4, "name": "view_auditor", "description": "Аудитор с правом только просмотра", "permission": []int{1, 6}},
			{"id": 5, "name": "executor", "description": "Исполнитель заявок", "permission": []int{1, 3}},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/permissions", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/equipment_types", func(c *gin.Context) {
		data := []gin.H{
			{"id": 1, "name": "Банкомат"},
			{"id": 2, "name": "Терминал"},
			{"id": 3, "name": "POS-Терминал"},
			{"id": 4, "name": "Цифровой офис"},
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.GET("/equipments", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/atm", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/terminal", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/pos", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/coeo", func(c *gin.Context) {
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
			"body":   data,
			"status": true,
		})
	})

	api.GET("/users/1", func(c *gin.Context) {
		data := gin.H{
			"id":           1,
			"fio":          "Шамолов Тупаланг Уроганович",
			"email":        "user1@arvand.tj",
			"phone_number": "+992 92 777 0000",

			"role_id":       1,
			"branch_id":     1,
			"department_id": 1,

			"office_id": 1,
			"otdel_id":  1,
			"position":  "Должность пользователя",
		}
		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	api.DELETE("/users/1", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": true,
		})
	})

	api.GET("/orders/1023/history", func(c *gin.Context) {
		data := gin.H{
			"status": true,
			"body": []gin.H{
				{
					"icon": "status_open",
					"lines": []string{
						"Создал(а) заявку: «Тест №77777777: Проверка авто-назначения»",
						"Назначен(а) исполнитель: Пользователь Тестовый",
						"Заявка должна автоматически назначиться на руководителя 7777777777!!.",
						"Прикреплен файл: 4a9e06c8-da60-4a12-a490-d70369421544.pdf",
					},
					"actor": gin.H{
						"id":  9,
						"fio": "Супер Админ Тестовый",
					},
					"created_at": "24.07.2025 / 15:14",
				},
				{
					"icon": "status_inprogress",
					"lines": []string{
						"Назначен(а) исполнитель: Исполнитель Тестовый 3",
						"Изменен статус заявки на ID: В работе",
						"Немедленно исправить ошибку 111111 !.",
						"Прикреплен файл: data-1752735035097.csv",
					},
					"actor": gin.H{
						"id":  11,
						"fio": "Пользователь Тестовый",
					},
					"created_at": "24.07.2025 / 15:30",
				},
			},
			"message": "История заявки успешно получена",
		}

		c.JSON(http.StatusOK, gin.H{
			"body":   data,
			"status": true,
		})
	})

	r.Run(":8080")
}

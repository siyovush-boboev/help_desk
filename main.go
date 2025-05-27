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

	r.GET("/admin/main", func(c *gin.Context) {
		c.HTML(http.StatusOK, "admin-main.html", nil)
	})

	r.GET("/user/main", func(c *gin.Context) {
		c.HTML(http.StatusOK, "user-main.html", nil)
	})

	r.GET("/executor/main", func(c *gin.Context) {
		c.HTML(http.StatusOK, "executor-main.html", nil)
	})

	r.GET("/auditor/main", func(c *gin.Context) {
		c.HTML(http.StatusOK, "auditor-main.html", nil)
	})

	r.POST("/login", func(c *gin.Context) {
		email := c.PostForm("email")
		password := c.PostForm("password")

		if email != "" && password != "" {
			// pretend we logged in successfully
			if email[:5] == "admin" {
				c.Redirect(http.StatusFound, "/admin/main")
			}
			if email[:4] == "user" {
				c.Redirect(http.StatusFound, "/user/main")
			}
			if email[:8] == "executor" {
				c.Redirect(http.StatusFound, "/executor/main")
			}
			if email[:7] == "auditor" {
				c.Redirect(http.StatusFound, "/auditor/main")
			}
			return
		}

		// if sum's wrong, reload login
		c.HTML(http.StatusUnauthorized, "login.html", gin.H{
			"error": "Неверный логин или пароль",
		})
	})

	r.Run(":8080")
}

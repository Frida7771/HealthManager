# Health Management Platform

## Project Overview
This project is a health management platform built with Java (Spring Boot) for the backend and Vue.js (Element UI) for the frontend.  
The system implements RESTful APIs, supports health record management, file uploads, data visualization, and role-based access control to enhance user experience and system scalability.

The backend uses MyBatis for Object-Relational Mapping (ORM) and MySQL for data storage.

---

## Environment Requirements
- JDK 17 or higher  
- Maven 3.8+  
- Node.js 16+  
- Vue CLI 4+  
- MySQL 8+

---

## Configuration

### Backend Configuration Example (`application.yml`)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/health_db?useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
    username: your_mysql_username
    password: your_mysql_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  mybatis:
    mapper-locations: classpath:mapper/*.xml
    type-aliases-package: cn.kmbeast.pojo.entity

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB

logging:
  level:
    cn.kmbeast: DEBUG
```


---
Note: Replace your_mysql_username and your_mysql_password with your actual MySQL credentials.

## How to Run
### Backend
```
cd source code/personal-health-api
mvn clean install
mvn spring-boot:run
```

### Frontend
```
cd source code/personal-heath-view
npm install
npm run serve
```

## Key Features
RESTful APIs for managing health records and user data;

Health record CRUD operations;

File upload support (e.g., user avatars, health reports);

Data visualization with charts to show health trends;

Role-based access control for user permission management

## Technologies: Java, Spring Boot, MyBatis, MySQL, Vue.js, Element UI

## Contact: li.bo10@northeastern.edu

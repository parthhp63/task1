-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: maindb
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `option_master`
--

DROP TABLE IF EXISTS `option_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `option_master` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `select_id` int DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `selected` varchar(45) DEFAULT NULL,
  `class` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`option_id`),
  KEY `select_id` (`select_id`),
  CONSTRAINT `option_master_ibfk_1` FOREIGN KEY (`select_id`) REFERENCES `select_master` (`select_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `option_master`
--

LOCK TABLES `option_master` WRITE;
/*!40000 ALTER TABLE `option_master` DISABLE KEYS */;
INSERT INTO `option_master` VALUES (1,1,'Male',NULL,NULL),(2,1,'Female',NULL,NULL),(3,2,'PHP',NULL,NULL),(4,2,'MYSQL',NULL,NULL),(5,2,'Ruby',NULL,NULL),(6,2,'DotNet',NULL,NULL),(7,2,'Laravel',NULL,NULL),(8,3,'Surat',NULL,NULL),(9,3,'Pune',NULL,NULL),(10,3,'Banglore',NULL,NULL),(11,3,'Mumbai',NULL,NULL),(12,3,'Ahmedabad',NULL,NULL),(13,4,'Developer',NULL,NULL),(14,4,'Designer',NULL,NULL),(15,4,'HR',NULL,NULL),(16,4,'Marketing',NULL,NULL),(17,4,'Cloud',NULL,NULL),(18,4,'Artictect',NULL,NULL),(19,5,'Single',NULL,NULL),(20,5,'Marreid',NULL,NULL),(21,6,'SSC',NULL,NULL),(22,6,'HSC',NULL,NULL),(23,6,'Diploma',NULL,NULL),(24,6,'Degree',NULL,NULL),(25,7,'English',NULL,NULL),(26,7,'Hindi',NULL,NULL),(27,7,'Marathi',NULL,NULL),(28,7,'Gujarati',NULL,NULL),(29,8,'Surat',NULL,NULL),(30,8,'Ahemdabad',NULL,NULL),(31,8,'Pune',NULL,NULL),(32,8,'Mumbai',NULL,NULL),(33,8,'Delhi',NULL,NULL),(34,8,'Banglore',NULL,NULL),(35,8,'Chennai',NULL,NULL),(36,8,'Vn Nagar',NULL,NULL),(37,8,'Chandigarh',NULL,NULL),(38,8,'Lucknow',NULL,NULL),(39,8,'Bhopal',NULL,NULL),(40,8,'Kanpur',NULL,NULL),(41,8,'Nagpur',NULL,NULL),(42,8,'Agra',NULL,NULL),(43,8,'Patna',NULL,NULL),(44,8,'Visakhapatnam',NULL,NULL);
/*!40000 ALTER TABLE `option_master` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-28 18:44:04

-- phpMyAdmin SQL Dump
-- version 3.3.9.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 29, 2013 at 07:14 PM
-- Server version: 5.5.12
-- PHP Version: 5.3.15

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `vohanka_jqTagTree`
--

-- --------------------------------------------------------

--
-- Table structure for table `connections`
--

CREATE TABLE IF NOT EXISTS `connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `object_id` int(11) NOT NULL,
  `predicate_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=9 ;

--
-- Dumping data for table `connections`
--

INSERT INTO `connections` (`id`, `subject_id`, `object_id`, `predicate_id`) VALUES
(1, 3, 1, 1),
(2, 4, 2, 1),
(3, 5, 1, 2),
(4, 6, 3, 2),
(8, 10, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `predicates`
--

CREATE TABLE IF NOT EXISTS `predicates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` text COLLATE utf8_unicode_ci NOT NULL,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=3 ;

--
-- Dumping data for table `predicates`
--

INSERT INTO `predicates` (`id`, `uri`, `name`) VALUES
(1, 'http://firstPredicate.com', 'default predicate'),
(2, 'http://sibling.com', 'Sibling');

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` text COLLATE utf8_unicode_ci NOT NULL,
  `label_en` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=11 ;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `uri`, `label_en`) VALUES
(1, 'http://zeroleveltag.com', 'First tag - level zero'),
(2, 'http://zeroleveltag.com', 'Secon tag - level zero'),
(3, 'http://firstleveltag.com/', 'Third tag'),
(4, 'http://firstleveltag.com', 'Fourth tag'),
(5, 'http://zerolevelPredicate.com', 'First Predicate'),
(6, 'http://firstlevelpredicate.com', 'Second predicate'),
(10, 'asd', 'Fifth Tag');

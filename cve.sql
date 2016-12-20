-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 20, 2016 at 06:04 PM
-- Server version: 5.7.16-0ubuntu0.16.04.1
-- PHP Version: 7.0.8-0ubuntu0.16.04.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cve`
--

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE `config` (
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`last_update`) VALUES
('2016-12-20 06:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `cve`
--

CREATE TABLE `cve` (
  `id` int(11) NOT NULL,
  `cve` varchar(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cve`
--

INSERT INTO `cve` (`id`, `cve`) VALUES
(1, 'CVE-2014-4943'),
(2, 'CVE-2014-4943'),
(3, 'CVE-2012-6657'),
(4, 'CVE-2014-7825'),
(5, 'CVE-2014-7826'),
(6, 'CVE-2014-9529'),
(7, 'CVE-2015-1465'),
(8, 'CVE-2014-9683'),
(9, 'CVE-2014-8160'),
(10, 'CVE-2014-0196'),
(11, 'CVE-2014-2851'),
(12, 'CVE-2014-4323'),
(13, 'CVE-2014-5206'),
(14, 'CVE-2014-7970'),
(15, 'CVE-2014-2523'),
(16, 'CVE-2012-6689'),
(17, 'CVE-2015-1420'),
(18, 'CVE-2014-8173'),
(19, 'CVE-2015-2922'),
(20, 'CVE-2014-9715'),
(21, 'CVE-2015-2041'),
(22, 'CVE-2015-3636'),
(23, 'CVE-2015-3339'),
(24, 'CVE-2015-5366'),
(25, 'CVE-2015-1534'),
(26, 'CVE-2015-8019'),
(27, 'CVE-2015-5697'),
(28, 'CVE-2015-8539'),
(29, 'CVE-2015-8215'),
(30, 'CVE-2016-0823'),
(31, 'CVE-2015-7872'),
(32, 'CVE-2015-8543'),
(33, 'CVE-2015-8575'),
(34, 'CVE-2015-7509'),
(35, 'CVE-2016-0728'),
(36, 'CVE-2015-8785'),
(37, 'CVE-2015-7550'),
(38, 'CVE-2016-0723'),
(39, 'CVE-2015-1805'),
(40, 'CVE-2016-0821'),
(41, 'CVE-2016-0774'),
(42, 'CVE-2015-0805'),
(43, 'CVE-2016-2384'),
(44, 'CVE-2016-2545'),
(45, 'CVE-2016-2546'),
(46, 'CVE-2016-2547'),
(47, 'CVE-2016-2847'),
(48, 'CVE-2016-2549'),
(49, 'CVE-2016-3951'),
(50, 'CVE-2016-3138'),
(51, 'CVE-2016-3156'),
(52, 'CVE-2016-3134'),
(53, 'CVE-2015-7515'),
(54, 'CVE-2016-4569'),
(55, 'CVE-2016-4578'),
(56, 'CVE-2016-3135'),
(57, 'CVE-2016-4805'),
(58, 'CVE-2016-4482'),
(59, 'CVE-2015-8830'),
(60, 'CVE-2016-2465'),
(61, 'CVE-2016-2466'),
(62, 'CVE-2016-2467'),
(63, 'CVE-2016-2468'),
(64, 'CVE-2016-2062'),
(65, 'CVE-2016-2474'),
(66, 'CVE-2016-2475'),
(67, 'CVE-2016-2066'),
(68, 'CVE-2016-2469'),
(69, 'CVE-2016-2061'),
(70, 'CVE-2016-2488'),
(71, 'CVE-2016-4470'),
(72, 'CVE-2016-2059'),
(73, 'CVE-2016-2053'),
(74, 'CVE-2015-4177'),
(75, 'CVE-2015-4170'),
(76, 'CVE-2015-2686'),
(77, 'CVE-2015-0569'),
(78, 'CVE-2016-5829'),
(79, 'CVE-2016-4998'),
(80, 'CVE-2016-5340'),
(81, 'CVE-2016-2503'),
(82, 'CVE-2016-2504'),
(83, 'CVE-2016-2059'),
(84, 'CVE-2016-3866'),
(85, 'CVE-2016-3859'),
(86, 'CVE-2016-5342'),
(87, 'CVE-2016-5343'),
(88, 'CVE-2016-3813'),
(89, 'CVE-2016-3768'),
(90, 'CVE-2016-2068'),
(91, 'CVE-2016-0819'),
(92, 'CVE-2016-7117'),
(93, 'CVE-2016-6683'),
(94, 'CVE-2015-8839'),
(95, 'CVE-2014-4655'),
(96, 'CVE-2016-3809'),
(97, 'CVE-2016-4486'),
(98, 'CVE-2016-6828'),
(99, 'CVE-2016-7042'),
(100, 'CVE-2016-5195'),
(101, 'CVE-2016-7910'),
(102, 'CVE-2016-7911'),
(103, 'CVE-2015-8962'),
(104, 'CVE-2016-2184'),
(105, 'CVE-2015-8963'),
(106, 'CVE-2016-6136'),
(107, 'CVE-2016-6738'),
(108, 'CVE-2016-6725'),
(109, 'CVE-2015-8961'),
(110, 'CVE-2016-6740'),
(111, 'CVE-2016-6741'),
(112, 'CVE-2016-3904'),
(113, 'CVE-2015-8964'),
(114, 'CVE-2016-7915'),
(115, 'CVE-2016-7914'),
(116, 'CVE-2016-7916'),
(117, 'CVE-2016-7917'),
(118, 'CVE-2015-0565'),
(119, 'CVE-2016-8655'),
(120, 'CVE-2015-8966'),
(121, 'CVE-2016-4794'),
(122, 'CVE-2016-9120'),
(123, 'CVE-2014-4014'),
(124, 'CVE-2015-8967'),
(125, 'CVE-2016-6755'),
(126, 'CVE-2016-6786'),
(127, 'CVE-2016-6787'),
(128, 'CVE-2016-6791'),
(129, 'CVE-2014-9909'),
(130, 'CVE-2014-9910'),
(131, 'CVE-2016-8397'),
(132, 'CVE-2016-8399'),
(133, 'CVE-2016-6756'),
(134, 'CVE-2016-6757'),
(135, 'CVE-2016-8405'),
(136, 'CVE-2016-8406'),
(137, 'CVE-2016-8407'),
(138, 'CVE-2016-8410');

-- --------------------------------------------------------

--
-- Table structure for table `kernel`
--

CREATE TABLE `kernel` (
  `id` int(11) NOT NULL,
  `repo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `patches`
--

CREATE TABLE `patches` (
  `id` int(11) NOT NULL,
  `kernel_id` int(11) NOT NULL,
  `cve_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `id` int(11) NOT NULL,
  `status` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `status`
--

INSERT INTO `status` (`id`, `status`) VALUES
(1, 'unpatched'),
(2, 'patched'),
(3, 'does not apply'),
(4, 'waiting on upstream'),
(5, 'on gerrit');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cve`
--
ALTER TABLE `cve`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kernel`
--
ALTER TABLE `kernel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patches`
--
ALTER TABLE `patches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kernel_id` (`kernel_id`),
  ADD KEY `cve_id` (`cve_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cve`
--
ALTER TABLE `cve`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;
--
-- AUTO_INCREMENT for table `kernel`
--
ALTER TABLE `kernel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `patches`
--
ALTER TABLE `patches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=0;
--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `patches`
--
ALTER TABLE `patches`
  ADD CONSTRAINT `patches_ibfk_1` FOREIGN KEY (`kernel_id`) REFERENCES `kernel` (`id`),
  ADD CONSTRAINT `patches_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`),
  ADD CONSTRAINT `patches_ibfk_4` FOREIGN KEY (`cve_id`) REFERENCES `cve` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

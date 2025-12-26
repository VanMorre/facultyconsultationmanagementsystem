-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 26, 2025 at 02:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `facultyconsultation`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_activitylogs`
--

CREATE TABLE `tbl_activitylogs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `activity_type` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `activity_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_activitylogs`
--

INSERT INTO `tbl_activitylogs` (`log_id`, `user_id`, `activity_type`, `action`, `activity_time`) VALUES
(1, 4, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 2, TimeRange: 5)', '2025-09-18 14:11:56'),
(8, 8, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 3, TimeRange: 4)', '2025-09-22 02:15:14'),
(9, 8, 'Booking Approval', 'Updated booking (ID: 32) to status: Approve', '2025-09-22 02:19:55'),
(10, 8, 'Booking Approval', 'Updated booking (ID: 31) to status: Approve', '2025-09-22 02:20:00'),
(11, 8, 'Booking Approval', 'Updated booking (ID: 30) to status: Approve', '2025-09-22 02:20:00'),
(12, 8, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 28, Date: 2025-09-22, TimeRange ID: 4)', '2025-09-22 02:20:38'),
(13, 8, 'Consultation Status Update', 'Updated consultation (ID: 16) to status: Completed', '2025-09-22 02:20:45'),
(14, 8, 'Booking Approval', 'Updated booking (ID: 33) to status: Approve', '2025-09-22 15:11:18'),
(15, 8, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 33, Date: 2025-09-22, TimeRange ID: 4)', '2025-09-22 15:11:50'),
(16, 8, 'Consultation Status Update', 'Updated consultation (ID: 17) to status: Completed', '2025-09-22 15:12:19'),
(17, 9, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 5, TimeRange: 4)', '2025-09-23 10:57:24'),
(18, 9, 'Booking Approval', 'Updated booking (ID: 34) to status: Approve', '2025-09-23 11:00:54'),
(19, 9, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 34, Date: 2025-09-23, TimeRange ID: 4)', '2025-09-23 11:01:25'),
(20, 9, 'Consultation Status Update', 'Updated consultation (ID: 18) to status: Completed', '2025-09-23 11:01:43'),
(21, 5, 'Booking Approval', 'Updated booking (ID: 35) to status: Approve', '2025-12-01 06:14:04'),
(22, 5, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 20, Date: 2025-12-01, TimeRange ID: 2)', '2025-12-01 06:15:58'),
(23, 5, 'Consultation Status Update', 'Updated consultation (ID: 19) to status: Completed', '2025-12-01 06:16:17'),
(24, 8, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 31)', '2025-12-03 13:57:29'),
(25, 8, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 29)', '2025-12-03 13:57:29'),
(26, 8, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 32)', '2025-12-03 13:57:29'),
(27, 8, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 30)', '2025-12-03 13:57:35'),
(28, 8, 'Consultation Completion', 'Completed consultation (ScheduleBooking ID: 20) with discussion and recommendations', '2025-12-03 15:03:22'),
(29, 8, 'Consultation Completion', 'Completed consultation (ScheduleBooking ID: 20) with discussion and recommendations', '2025-12-03 15:03:27'),
(30, 4, 'Consultation Scheduling', 'Scheduled consultation (Booking ID: 27)', '2025-12-03 15:16:46'),
(31, 4, 'Consultation Status Update', 'Updated consultation (ID: 24) to status: Scheduled', '2025-12-03 15:16:50'),
(32, 4, 'Consultation Completion', 'Completed consultation (ScheduleBooking ID: 24) with discussion and recommendations', '2025-12-03 15:40:13'),
(33, 4, 'Booking Completion', 'Completed booking (ID: 36) with discussion and recommendation', '2025-12-20 12:48:19'),
(34, 4, 'Booking Completion', 'Completed booking (ID: 37) with discussion and recommendation', '2025-12-20 16:52:52'),
(35, 4, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 2, Availability: 3, TimeRange: 11)', '2025-12-26 04:51:30'),
(36, 10, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 2, Availability: 4, TimeRange: 3)', '2025-12-26 05:24:56'),
(37, 10, 'Booking Completion', 'Completed booking (ID: 39) with discussion and recommendation', '2025-12-26 05:36:28'),
(38, 10, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 3, TimeRange: 2)', '2025-12-26 06:03:19'),
(39, 10, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 3, TimeRange: 1)', '2025-12-26 06:22:57'),
(40, 4, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 1, TimeRange: 7)', '2025-12-26 06:23:57'),
(41, 10, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 3, Availability: 1, TimeRange: 2)', '2025-12-26 06:48:08'),
(42, 4, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 2, Availability: 6, TimeRange: 2)', '2025-12-26 07:00:24'),
(43, 4, 'Add-Availabilityschedule', 'Set faculty availability (Recurrence: 2, Availability: 5, TimeRange: 1)', '2025-12-26 07:09:26'),
(44, 10, 'Booking Completion', 'Completed booking (ID: 46) with discussion and recommendation', '2025-12-26 07:10:16'),
(45, 10, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 1)', '2025-12-26 07:17:50'),
(46, 10, 'Booking Completion', 'Completed booking (ID: 47) with discussion and recommendation', '2025-12-26 07:23:46'),
(47, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 1)', '2025-12-26 09:22:53'),
(48, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 1)', '2025-12-26 09:24:22'),
(49, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 2)', '2025-12-26 09:24:59'),
(50, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 1)', '2025-12-26 09:29:40'),
(51, 4, 'Booking Completion', 'Completed booking (ID: 51) with discussion and recommendation', '2025-12-26 09:31:16'),
(52, 4, 'Booking Completion', 'Completed booking (ID: 52) with discussion and recommendation', '2025-12-26 09:34:10'),
(53, 11, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 10)', '2025-12-26 09:41:21'),
(54, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 5)', '2025-12-26 09:41:42'),
(55, 11, 'Booking Completion', 'Completed booking (ID: 53) with discussion and recommendation', '2025-12-26 09:42:19'),
(56, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 7)', '2025-12-26 10:27:51'),
(57, 11, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 1)', '2025-12-26 10:54:13'),
(58, 11, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 1)', '2025-12-26 10:54:29'),
(59, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 2, TimeRange: 1)', '2025-12-26 10:55:01'),
(60, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 3, TimeRange: 4)', '2025-12-26 10:55:24'),
(61, 11, 'Booking Completion', 'Completed booking (ID: 63) with discussion and recommendation', '2025-12-26 11:04:56'),
(62, 11, 'Booking Completion', 'Completed booking (ID: 62) with discussion and recommendation', '2025-12-26 11:05:04'),
(63, 4, 'Booking Completion', 'Completed booking (ID: 65) with discussion and recommendation', '2025-12-26 11:12:11'),
(64, 4, 'Booking Completion', 'Completed booking (ID: 64) with discussion and recommendation', '2025-12-26 11:12:22'),
(65, 4, 'Booking Completion', 'Completed booking (ID: 66) with discussion and recommendation', '2025-12-26 11:13:03'),
(66, 4, 'Booking Completion', 'Completed booking (ID: 67) with discussion and recommendation', '2025-12-26 11:26:07'),
(67, 11, 'Booking Completion', 'Completed booking (ID: 69) with discussion and recommendation', '2025-12-26 11:37:08'),
(68, 11, 'Booking Completion', 'Completed booking (ID: 68) with discussion and recommendation', '2025-12-26 11:37:12'),
(69, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 1)', '2025-12-26 11:57:26'),
(70, 4, 'Booking Completion', 'Completed booking (ID: 71) with discussion and recommendation', '2025-12-26 11:58:05'),
(71, 4, 'Booking Completion', 'Completed booking (ID: 70) with discussion and recommendation', '2025-12-26 11:58:10'),
(72, 4, 'Booking Completion', 'Completed booking (ID: 72) with discussion and recommendation', '2025-12-26 12:05:19'),
(73, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 4, TimeRange: 3)', '2025-12-26 12:08:10'),
(74, 4, 'Booking Completion', 'Completed booking (ID: 75) with discussion and recommendation', '2025-12-26 12:08:56'),
(75, 4, 'Booking Completion', 'Completed booking (ID: 74) with discussion and recommendation', '2025-12-26 12:09:00'),
(76, 4, 'Booking Completion', 'Completed booking (ID: 73) with discussion and recommendation', '2025-12-26 12:09:04'),
(77, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 6)', '2025-12-26 12:40:17'),
(78, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 1, TimeRange: 4)', '2025-12-26 12:43:19'),
(79, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 5, TimeRange: 4)', '2025-12-26 12:45:19'),
(80, 11, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 3, TimeRange: 6)', '2025-12-26 12:55:00'),
(81, 11, 'Booking Completion', 'Completed booking (ID: 78) with discussion and recommendation', '2025-12-26 12:55:45'),
(82, 4, 'Booking Completion', 'Completed booking (ID: 77) with discussion and recommendation', '2025-12-26 12:56:05'),
(83, 4, 'Booking Completion', 'Completed booking (ID: 76) with discussion and recommendation', '2025-12-26 12:56:10'),
(84, 4, 'Add-Availabilityschedule', 'Set faculty availability (Availability: 4, TimeRange: 8)', '2025-12-26 12:59:57');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_approval`
--

CREATE TABLE `tbl_approval` (
  `approval_id` int(11) NOT NULL,
  `approval_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_approval`
--

INSERT INTO `tbl_approval` (`approval_id`, `approval_name`) VALUES
(1, 'Approve'),
(2, 'Disapprove'),
(3, 'Reschedule'),
(4, 'Conflict'),
(5, 'Pending'),
(6, 'Scheduled'),
(7, 'Completed'),
(8, 'Cancelled');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_availabilityday`
--

CREATE TABLE `tbl_availabilityday` (
  `availability_id` int(11) NOT NULL,
  `availability_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_availabilityday`
--

INSERT INTO `tbl_availabilityday` (`availability_id`, `availability_name`) VALUES
(1, 'Monday'),
(2, 'Tuesday'),
(3, 'Wednesday'),
(4, 'Thursday'),
(5, 'Friday'),
(6, 'Saturday');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_booking`
--

CREATE TABLE `tbl_booking` (
  `booking_id` int(11) NOT NULL,
  `availabilityfaculty_id` int(11) NOT NULL,
  `approval_id` int(11) NOT NULL,
  `approval_date` datetime DEFAULT NULL,
  `subject_name` varchar(255) NOT NULL,
  `student_id` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `booking_date` date NOT NULL,
  `timerange_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_course`
--

CREATE TABLE `tbl_course` (
  `course_id` int(11) NOT NULL,
  `course_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_course`
--

INSERT INTO `tbl_course` (`course_id`, `course_name`) VALUES
(1, 'Bachelor of Science in Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_feedback`
--

CREATE TABLE `tbl_feedback` (
  `feedback_id` int(11) NOT NULL,
  `schedulebookings_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_role`
--

CREATE TABLE `tbl_role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_role`
--

INSERT INTO `tbl_role` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(2, 'Teacher'),
(3, 'Student');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_scheduledbookings`
--

CREATE TABLE `tbl_scheduledbookings` (
  `schedulebookings_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `discussion` varchar(255) NOT NULL,
  `recommendation` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_setavailabilityfaculty`
--

CREATE TABLE `tbl_setavailabilityfaculty` (
  `availabilityfaculty_id` int(11) NOT NULL,
  `availability_id` int(11) NOT NULL,
  `timerange_id` int(11) NOT NULL,
  `availableslotstatus_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_status`
--

CREATE TABLE `tbl_status` (
  `status_id` int(11) NOT NULL,
  `status_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_status`
--

INSERT INTO `tbl_status` (`status_id`, `status_name`) VALUES
(1, 'Active'),
(2, 'Inactive');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_students`
--

CREATE TABLE `tbl_students` (
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `student_email` varchar(255) NOT NULL,
  `student_password` varchar(255) NOT NULL,
  `course_id` int(11) NOT NULL,
  `year_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_students`
--

INSERT INTO `tbl_students` (`student_id`, `student_name`, `age`, `contact`, `photo_url`, `student_email`, `student_password`, `course_id`, `year_id`, `role_id`, `created_at`, `updated_at`) VALUES
(12, 'banbanguangco', 23, '09972664749', 'uploads/1766740918_manphoto.png', 'banbanguangco@phinmaed.com', '426e7369399c3813032473b862c4503a99e906ed', 1, 4, 3, '2025-12-26 17:21:58', '2025-12-26 17:21:58');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_timerange`
--

CREATE TABLE `tbl_timerange` (
  `timerange_id` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_timerange`
--

INSERT INTO `tbl_timerange` (`timerange_id`, `start_time`, `end_time`) VALUES
(1, '07:00:00', '08:00:00'),
(2, '08:00:00', '09:00:00'),
(3, '09:00:00', '10:00:00'),
(4, '10:00:00', '11:00:00'),
(5, '11:00:00', '12:00:00'),
(6, '12:00:00', '13:00:00'),
(7, '13:00:00', '14:00:00'),
(8, '14:00:00', '15:00:00'),
(9, '15:00:00', '16:00:00'),
(10, '16:00:00', '17:00:00'),
(11, '17:00:00', '18:00:00'),
(12, '18:00:00', '19:00:00'),
(13, '19:00:00', '20:00:00'),
(14, '20:00:00', '21:00:00'),
(15, '21:00:00', '22:00:00'),
(16, '22:00:00', '23:00:00'),
(17, '23:00:00', '00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `user_status` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`user_id`, `username`, `user_password`, `role_id`, `fullname`, `age`, `address`, `contact`, `email`, `photo_url`, `user_status`, `created_at`, `updated_at`) VALUES
(4, 'darwingaludo', '00a299e698108c1ab1f3bdb002065eca1ed43b88', 1, 'Darwin Galudos', 36, 'Carmen Cagayan de oro City', '09171234567', 'darwingaludo@phinmaed.com', 'uploads/1758040519_userphoto.png', 1, '2025-08-03 19:37:26', '2025-12-01 10:27:18'),
(5, 'jaylarosa', '83b27cd1ed897640e0ed89ea9485f0ad80222b0d', 1, 'Jay La Rosa', 30, 'Carmen, Cagayan de oro City', '09172345678', 'jaylarosa@phinmaed.com', 'uploads/1743761769_adminuser.png', 1, '2025-08-03 19:37:26', '2025-12-26 16:18:45'),
(7, 'lovejeanvillanueva', 'bec6bc0d3ede9ee94f6effb4da9af631457ac18b', 2, 'lovejeanvillanueva', 39, 'Xavier States Cagayan de oro City', '09975443214', 'lovejeanvilluanueva@phinmaed.com', 'uploads/1757839452_cashiersuser.png', 1, '2025-09-14 16:44:12', '2025-12-01 10:27:18'),
(8, 'rieljuncainglet', 'a6b061057e49d12ecc118c606775e13a0c18f1b7', 2, 'rieljun_cainglet', 22, 'Bonbon, Cagayan de oro City', '09659984571', 'rieljuncainglet@phinmaed.com', 'uploads/1758153250_userphoto.png', 1, '2025-09-14 16:48:55', '2025-12-01 10:27:18'),
(9, 'lordniel', '20e463f0a6b7cc50012b4009e9a0087b4e5bd5ad', 2, 'lordnielactub', 27, 'Zayas Landfill', '923734482', 'lordnielactub@phinmaed.com', 'uploads/1758624851_cashiersuser.png', 1, '2025-09-23 18:54:11', '2025-12-01 10:27:19'),
(10, 'johnbert', '38d890646905d0db1bbe6f34d65cbc52f6f8f431', 2, 'johnberte', 34, 'Opol Misamis Oriental', '093381472213', 'johnbert@phinmaed.com', 'uploads/1766726617_cashiersuser.png', 1, '2025-12-26 13:23:37', '2025-12-26 13:23:37'),
(11, 'maamololor', '691815a9bca262af7a1ea60595bfaeee33f1adec', 1, 'maamololor', 45, 'Carmen,Cagayan De Oro City', '09665731234', 'maamololor@phinmaed.com', 'uploads/1766737645_cashiersuser.png', 1, '2025-12-26 16:27:25', '2025-12-26 16:27:25'),
(12, 'mosheh', '4ca90c580e54c07d7c67a43a2c5d9d58bb93df23', 2, 'moshehcyrill', 38, 'Carmen,Cagayan De Oro City', '09833356732', 'moshehcyrill@phinmaed.com', 'uploads/1766738201_manphoto.png', 1, '2025-12-26 16:36:41', '2025-12-26 16:36:41'),
(13, 'leilani', 'e5dd6b93246fb3221955d0f0f53fe053d3834e1d', 2, 'leilaniranara', 42, 'Carmen,Cagayan De Oro City', '09453765148', 'leilaniranara@phinmaed.com', 'uploads/1766738311_cashiersuser.png', 1, '2025-12-26 16:38:31', '2025-12-26 16:38:31'),
(14, 'jayson', '8562a51761cf270fffafe2345ffd4989108dcae5', 2, 'jaysonbelmes', 37, 'Carmen,Cagayan De Oro City', '09776456732', 'jaysonbelmes@phinmaed.com', 'uploads/1766738406_manphoto.png', 1, '2025-12-26 16:40:06', '2025-12-26 16:40:06'),
(15, 'claire', '30801c1b40bbced1372151419d6d695e1eb5bf41', 2, 'clairedragon', 26, 'Carmen,Cagayan De Oro City', '09345567645', 'clairedragon@phinmaed.com', 'uploads/1766738507_cashiersuser.png', 1, '2025-12-26 16:41:47', '2025-12-26 16:41:47'),
(16, 'faith', 'b23b784d577926742cc18f90dfc0b01215694b19', 2, 'faithnave', 26, 'Carmen,Cagayan De Oro City', '09889456172', 'faithnavedolera@phinmaed.com', 'uploads/1766738594_cashiersuser.png', 1, '2025-12-26 16:43:14', '2025-12-26 16:43:14'),
(17, 'angel', '0eb62b73820f9ef887666c07af519936451a76cd', 2, 'angellampitao', 26, 'Carmen,Cagayan De Oro City', '09554673217', 'angelampitao@phinmaed.com', 'uploads/1766738705_cashiersuser.png', 1, '2025-12-26 16:45:05', '2025-12-26 16:45:05'),
(18, 'arnelllemit', '26e8a1e37da80f3774b94475e71247046bc49fef', 2, 'arnellemit', 29, 'Carmen,Cagayan De Oro City', '09881675432', 'arnellemit@phinmaed.com', 'uploads/1766738772_manphoto.png', 1, '2025-12-26 16:46:12', '2025-12-26 16:46:12'),
(19, 'adormie', 'f3e9bccc30c4fe70dcf1e8602935b66ab38a6de9', 2, 'adormiemacario', 29, 'Carmen,Cagayan De Oro City', '09665332341', 'adormiemacario@phinmaed.com', 'uploads/1766738844_manphoto.png', 1, '2025-12-26 16:47:24', '2025-12-26 16:47:24'),
(20, 'irish', '9cf8daa944ab367ac8acf7954412309c6bb94a5e', 2, 'irishopiso', 26, 'Carmen,Cagayan De Oro City', '09221456781', 'irishopiso@phinmaed.com', 'uploads/1766738921_cashiersuser.png', 1, '2025-12-26 16:48:41', '2025-12-26 16:48:41'),
(21, 'jeremiah', '5e2f68f197b9db8605f25c72816857b4ca0b018b', 2, 'jeremiahsimo', 24, 'Carmen,Cagayan De Oro City', '09555634517', 'jeremiahsimo@phinmaed.com', 'uploads/1766739004_manphoto.png', 1, '2025-12-26 16:50:04', '2025-12-26 16:50:04'),
(22, 'joannie', '3500a6e6e89a8bce7b6f9550db89c7d117ad8e22', 2, 'joannietaypin', 28, 'Carmen,Cagayan De Oro City', '09443221348', 'joannietaypin@phinmaed.com', 'uploads/1766739080_cashiersuser.png', 1, '2025-12-26 16:51:20', '2025-12-26 16:51:20'),
(23, 'kevin', '19e84124b25b92c5dcede10b482eb182133dca34', 2, 'kevinranan', 28, 'Carmen,Cagayan De Oro City', '09221567891', 'kevinranan@phinmaed.com', 'uploads/1766739136_manphoto.png', 1, '2025-12-26 16:52:16', '2025-12-26 16:52:16'),
(24, 'reneefe', '807433ad2f7e2935dc65ac8838b3fffac137f1b3', 2, 'reneefe', 25, 'Carmen,Cagayan De Oro City', '09887456432', 'reneefecasicas@phinmaed.com', 'uploads/1766739269_cashiersuser.png', 1, '2025-12-26 16:54:29', '2025-12-26 16:54:29'),
(25, 'queeniearjee', '842ed133b347a83ebb0cdc11006e3a9fdbb6d5f1', 2, 'queeniearjee', 23, 'Carmen,Cagayan De Oro City', '09556456432', 'queeniearjeelucagbo@phinmaed.com', 'uploads/1766739445_cashiersuser.png', 1, '2025-12-26 16:57:25', '2025-12-26 16:57:25'),
(26, 'archieliz', '74ade33688ce2a706f83bdc95cf25e5a516c1685', 2, 'archieliz', 26, 'Carmen,Cagayan De Oro City', '09855634516', 'achielizasesor@phinmaed.com', 'uploads/1766739556_cashiersuser.png', 1, '2025-12-26 16:59:16', '2025-12-26 16:59:16'),
(27, 'grachel', 'afe7ae7e722baf1507dc098d332115a6679eb07d', 2, 'grachelcantila', 31, 'Carmen,Cagayan De Oro City', '09555734591', 'grachelcantila@phinmaed.com', 'uploads/1766739674_cashiersuser.png', 1, '2025-12-26 17:01:14', '2025-12-26 17:01:14'),
(28, 'joshua', '172d6209abdee7506c67e47cf5448156bd089efa', 2, 'joshuacalma', 24, 'Carmen,Cagayan De Oro City', '09221456742', 'joshuacalma@phinmaed.com', 'uploads/1766739760_manphoto.png', 1, '2025-12-26 17:02:40', '2025-12-26 17:02:40'),
(29, 'ianpaul', '871cbc19d077ac927bf2e89350ac83c5a37b9fdf', 2, 'ianpaulsalvador', 28, 'Carmen,Cagayan De Oro City', '09772145671', 'ianpaulsalvador@phinmaed.com', 'uploads/1766739821_manphoto.png', 1, '2025-12-26 17:03:41', '2025-12-26 17:03:41'),
(30, 'mark', '821f340d01c66ec68c7fad530825df245ae1d627', 2, 'markanthony', 25, 'Carmen,Cagayan De Oro City', '09221557893', 'markanthonysilaya@phinmaed.com', 'uploads/1766739914_manphoto.png', 1, '2025-12-26 17:05:14', '2025-12-26 17:05:14'),
(31, 'ivymae', '7f92b51bf6fe58c2495d6ab305ee70d1a743ccf3', 2, 'ivymae', 28, 'Carmen,Cagayan De Oro City', '09552123478', 'ivymaebagongon@phinmaed.com', 'uploads/1766739969_cashiersuser.png', 1, '2025-12-26 17:06:09', '2025-12-26 17:06:09'),
(32, 'justin', '291d10ef2c42c5c88abab1b3fa427c95d36da8e7', 2, 'justin', 28, 'Carmen,Cagayan De Oro City', '09784562341', 'justinvergara@phinmaed.com', 'uploads/1766740060_manphoto.png', 1, '2025-12-26 17:07:40', '2025-12-26 17:07:40'),
(33, 'rembrandt', 'd755b817641df3e6f063b0e402066fa99e24a25b', 2, 'rembrandtgordo', 28, 'Carmen,Cagayan De Oro City', '09431235678', 'rembrandtgordo@phinmaed.com', 'uploads/1766740153_manphoto.png', 1, '2025-12-26 17:09:13', '2025-12-26 17:09:13'),
(34, 'lloyd', 'a8e5a1e3f115e1bddd39a5e008f0da3434dc11c1', 2, 'lloydaisne', 25, 'Carmen,Cagayan De Oro City', '09776345167', 'lloydaisne@phinmaed.com', 'uploads/1766740204_manphoto.png', 1, '2025-12-26 17:10:04', '2025-12-26 17:10:04');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_yearlevel`
--

CREATE TABLE `tbl_yearlevel` (
  `year_id` int(11) NOT NULL,
  `year_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_yearlevel`
--

INSERT INTO `tbl_yearlevel` (`year_id`, `year_name`) VALUES
(1, 'First Year'),
(2, 'Second Year'),
(3, 'Third Year'),
(4, 'Fourth Year');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_activitylogs`
--
ALTER TABLE `tbl_activitylogs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_actuser` (`user_id`);

--
-- Indexes for table `tbl_approval`
--
ALTER TABLE `tbl_approval`
  ADD PRIMARY KEY (`approval_id`);

--
-- Indexes for table `tbl_availabilityday`
--
ALTER TABLE `tbl_availabilityday`
  ADD PRIMARY KEY (`availability_id`);

--
-- Indexes for table `tbl_booking`
--
ALTER TABLE `tbl_booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `fk_approval` (`approval_id`),
  ADD KEY `fk_student` (`student_id`),
  ADD KEY `fk_sub` (`subject_name`),
  ADD KEY `fk_availfaculty` (`availabilityfaculty_id`),
  ADD KEY `fk_timerange` (`timerange_id`);

--
-- Indexes for table `tbl_course`
--
ALTER TABLE `tbl_course`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `tbl_feedback`
--
ALTER TABLE `tbl_feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `fk_feedsbook` (`schedulebookings_id`),
  ADD KEY `fk_feeduser` (`user_id`);

--
-- Indexes for table `tbl_role`
--
ALTER TABLE `tbl_role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `tbl_scheduledbookings`
--
ALTER TABLE `tbl_scheduledbookings`
  ADD PRIMARY KEY (`schedulebookings_id`),
  ADD KEY `fk_books` (`booking_id`),
  ADD KEY `fk_usr` (`user_id`);

--
-- Indexes for table `tbl_setavailabilityfaculty`
--
ALTER TABLE `tbl_setavailabilityfaculty`
  ADD PRIMARY KEY (`availabilityfaculty_id`),
  ADD KEY `fk_facultyday` (`availability_id`),
  ADD KEY `fk_facultytime` (`timerange_id`),
  ADD KEY `fk_facultyusers` (`user_id`),
  ADD KEY `fk_facultyslotstatus` (`availableslotstatus_id`);

--
-- Indexes for table `tbl_status`
--
ALTER TABLE `tbl_status`
  ADD PRIMARY KEY (`status_id`);

--
-- Indexes for table `tbl_students`
--
ALTER TABLE `tbl_students`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `fk_course` (`course_id`),
  ADD KEY `fk_year` (`year_id`),
  ADD KEY `fk_roles` (`role_id`);

--
-- Indexes for table `tbl_timerange`
--
ALTER TABLE `tbl_timerange`
  ADD PRIMARY KEY (`timerange_id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_role` (`role_id`),
  ADD KEY `fk_status` (`user_status`);

--
-- Indexes for table `tbl_yearlevel`
--
ALTER TABLE `tbl_yearlevel`
  ADD PRIMARY KEY (`year_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_activitylogs`
--
ALTER TABLE `tbl_activitylogs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `tbl_approval`
--
ALTER TABLE `tbl_approval`
  MODIFY `approval_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_availabilityday`
--
ALTER TABLE `tbl_availabilityday`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_booking`
--
ALTER TABLE `tbl_booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `tbl_course`
--
ALTER TABLE `tbl_course`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_feedback`
--
ALTER TABLE `tbl_feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_role`
--
ALTER TABLE `tbl_role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_scheduledbookings`
--
ALTER TABLE `tbl_scheduledbookings`
  MODIFY `schedulebookings_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `tbl_setavailabilityfaculty`
--
ALTER TABLE `tbl_setavailabilityfaculty`
  MODIFY `availabilityfaculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `tbl_status`
--
ALTER TABLE `tbl_status`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_students`
--
ALTER TABLE `tbl_students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_timerange`
--
ALTER TABLE `tbl_timerange`
  MODIFY `timerange_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `tbl_yearlevel`
--
ALTER TABLE `tbl_yearlevel`
  MODIFY `year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_activitylogs`
--
ALTER TABLE `tbl_activitylogs`
  ADD CONSTRAINT `fk_actuser` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_booking`
--
ALTER TABLE `tbl_booking`
  ADD CONSTRAINT `fk_approval` FOREIGN KEY (`approval_id`) REFERENCES `tbl_approval` (`approval_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_availfaculty` FOREIGN KEY (`availabilityfaculty_id`) REFERENCES `tbl_setavailabilityfaculty` (`availabilityfaculty_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_student` FOREIGN KEY (`student_id`) REFERENCES `tbl_students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_timerange` FOREIGN KEY (`timerange_id`) REFERENCES `tbl_timerange` (`timerange_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_feedback`
--
ALTER TABLE `tbl_feedback`
  ADD CONSTRAINT `fk_feedsbook` FOREIGN KEY (`schedulebookings_id`) REFERENCES `tbl_scheduledbookings` (`schedulebookings_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_feeduser` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_scheduledbookings`
--
ALTER TABLE `tbl_scheduledbookings`
  ADD CONSTRAINT `fk_books` FOREIGN KEY (`booking_id`) REFERENCES `tbl_booking` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usr` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_setavailabilityfaculty`
--
ALTER TABLE `tbl_setavailabilityfaculty`
  ADD CONSTRAINT `fk_facultyday` FOREIGN KEY (`availability_id`) REFERENCES `tbl_availabilityday` (`availability_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_facultyslotstatus` FOREIGN KEY (`availableslotstatus_id`) REFERENCES `tbl_status` (`status_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_facultytime` FOREIGN KEY (`timerange_id`) REFERENCES `tbl_timerange` (`timerange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_facultyusers` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_students`
--
ALTER TABLE `tbl_students`
  ADD CONSTRAINT `fk_course` FOREIGN KEY (`course_id`) REFERENCES `tbl_course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_roles` FOREIGN KEY (`role_id`) REFERENCES `tbl_role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_year` FOREIGN KEY (`year_id`) REFERENCES `tbl_yearlevel` (`year_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `fk_role` FOREIGN KEY (`role_id`) REFERENCES `tbl_role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_status` FOREIGN KEY (`user_status`) REFERENCES `tbl_status` (`status_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

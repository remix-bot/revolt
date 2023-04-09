# WIP Web Dashboard for Remix

Control Remix through a web interface and set server settings and similar.

Installation instructions will follow soon:tm:

## Setup

1. Create a mysql server with the following table:
  ```MySQL
  CREATE TABLE `logins` (
    `user` varchar(26) NOT NULL,
    `token` varchar(50) NOT NULL,
    `verified` tinyint(1) NOT NULL DEFAULT '0',
    `createdAt` datetime NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

  CREATE TABLE `ksiTokens` (
  `user` varchar(26) NOT NULL,
  `id` varchar(50) NOT NULL,
  `token` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8_general_ci NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
  ```
2. Fill out the connection details in `config.json` in the remix root directory (See `config.example.json`)
3. SSL setup: TODO

Credits for Website design: NoLogicAlan, ophx

<?php

declare(strict_types=1);

/* Servers configuration */
$i = 0;

/* Server: MariaDB [1] */
$i++;
$cfg['Servers'][$i]['verbose'] = 'MariaDB';
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['port'] = 3306;
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = getenv('MYSQL_ROOT_PASSWORD') ?: 'secret';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;

/* End of servers configuration */

$cfg['blowfish_secret'] = 'YOUR_BLOWFISH_SECRET_HERE'; /* YOU MUST FILL IN THIS FOR COOKIE AUTH! */

/*
 * Directories for saving/loading files from server
 */
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';

/*
 * This is needed for cookie based authentication to encrypt password in
 * cookie. Needs to be 32 chars long.
 */
$cfg['blowfish_secret'] = 'a87b6c5d4e3f2a1b0c9d8e7f6a5b4c3d'; // Replace with a strong, random 32-character string

?>

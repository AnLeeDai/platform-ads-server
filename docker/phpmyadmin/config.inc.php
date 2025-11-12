<?php

declare(strict_types=1);

/* Servers configuration */
$i = 0;

/* Server: External DB [1] */
$i++;
$cfg['Servers'][$i]['verbose'] = getenv('PMA_VERBOSE') ?: 'External Database';
$cfg['Servers'][$i]['host'] = getenv('PMA_HOST') ?: '127.0.0.1'; // Default to localhost if not set
$cfg['Servers'][$i]['port'] = getenv('PMA_PORT') ?: 3306;
$cfg['Servers'][$i]['socket'] = '';
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['user'] = getenv('PMA_USER') ?: 'root';
$cfg['Servers'][$i]['password'] = getenv('PMA_PASSWORD') ?: '';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;

/* Allow connecting to arbitrary servers */
$cfg['AllowArbitraryServer'] = true;

/* End of servers configuration */

/*
 * This is needed for cookie based authentication to encrypt password in
 * cookie. Needs to be 32 chars long.
 */
$cfg['blowfish_secret'] = getenv('PMA_BLOWFISH_SECRET') ?: 'a87b6c5d4e3f2a1b0c9d8e7f6a5b4c3d'; // Replace with a strong, random 32-character string

/*
 * Directories for saving/loading files from server
 */
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';

?>

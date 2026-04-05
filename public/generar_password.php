<?php
// Script temporal para generar hash de contraseña
// Uso: php generar_password.php

echo password_hash("Laterraza123!", PASSWORD_BCRYPT) . "\n";

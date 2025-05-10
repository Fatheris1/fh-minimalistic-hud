fx_version 'cerulean'
game 'gta5'

author 'Fatheris'
description 'Modern HUD'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts {
    '@es_extended/imports.lua',
    'config.lua'
}

client_scripts {
    'client/*.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js'
}

dependencies {
    'es_extended'
} 
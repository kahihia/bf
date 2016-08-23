# BlackFriday

> See: https://bitbucket.org/BlueTeam-220Volt/blackfriday

## Структура проекта

* `blackfriday`
    * `apps` - приложения
    * `libs` - библиотеки и утилиты
        * `compressor_assets` - утилиты для удобной работы с compressor и bower
    * `settings` - пакет настроек
    * `static` - статика
        * `assets` - компилируемая статика
        * `bower_components` - bower-компоненты
        * `static` - некомпилируемая статика
    * `templates` - общие шаблоны проекта


## Development

### Install project
```
cd /sites
git clone git@bitbucket.org:BlueTeam-220Volt/blackfriday.git
cd blackfriday
```

#### Python
```
cd /sites/blackfriday
virtualenv --python=python3.5 .env
source .env/bin/activate
sudo apt-get install python3.5-dev gcc
pip install -r requirements.txt
```

#### DB
```
sudo apt-get install postgresql-9.4
sudo su postgres
createuser -P blackfriday
    Enter password for new role:
    Enter it again:
createdb -O blackfriday blackfriday
exit
./manage.py migrate
```

## Run project
```
cd /sites/blackfriday
source .env/bin/activate
./manage.py runserver
```
open http://blackfriday.local:8080/


## JavaScript

### Init
```
npm install
```


## Update
```
git pull
source .env/bin/activate
pip install -r requirements.txt --upgrade
./manage.py migrate
npm install
```

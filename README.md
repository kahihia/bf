# BlackFriday

> See: https://bitbucket.org/BlueTeam-220Volt/blackfriday

## Структура проекта

* `blackfriday`
    * `apps` - приложения
    * `libs` - библиотеки и утилиты
    * `settings` - пакет настроек
    * `static` - статика
        * `assets` - компилируемая статика
        * `static` - некомпилируемая статика
    * `templates` - общие шаблоны проекта


## Development


### Dependencies

Для генерации pdf используется weasypring. Необходима установка системных пакетов, подробности по ссылке
http://weasyprint.readthedocs.io/en/latest/install.html

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
sudo apt-get install python3.5-dev gcc libffi-dev
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
open http://blackfriday.local:8000/


## JavaScript

### Init
```
npm install
```

### Develop
Autobuild
```
npm run start
```

Manual build
```
npm run build
```

Manual build without compression
```
npm run build:dev
```


## Update
```
git pull
source .env/bin/activate
pip install -r requirements.txt --upgrade
./manage.py migrate
npm install
```


### Testing

Для написания и запуска юнит-тестов используется pytest. Запускать тесты рекомендуется следующей командой
```
py.test
```
Однако есть возможность запустить тесты через django management command:
```
./manage.py test --settings=blackfriday.settings.testing
```

Feature: Управление флагами видимости баннеров

    Background:
        Given I am an advertiser
        And I have moderated merchant
        And there is uploaded image in system with id=42
        And there are categories with:
            |id|
            |1|
            |2|


    Scenario: Нельзя создать баннер с категориями, на главной и в рассылке
        Given I am logged in
        When I create banner with:
            | on_main | in_mailing | categories |  
            | true    | true       | [1, 2]       |  
        Then response status is 400

    Scenario: Нельзя создать баннер в рассылке и на главной
        Given I am logged in
        When I create banner with:
            | on_main | in_mailing |  
            | true    | true       |  
        Then response status is 400

    Scenario: Нельзя создать баннер с категорями и в рассылке
        Given I am logged in
        When I create banner with:
            | in_mailing | categories |  
            | true       | [1, 2]    |  
        Then response status is 400

    Scenario: Нельзя ставить существующий баннер на главную и в рассылку
        Given I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | false      | false   | null       |  
        When I change banner with:
            | on_main | in_mailing |  
            | true    | true       |  
        Then response status is 400

    Scenario: Нельзя добавлять категории и ставить в рассылку уже существующий баннер
        Given I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | false      | false   | null       |  
        When I change banner with:
            | in_mailing | categories |  
            | true       | [1, 2]    |  
        Then response status is 400

    Scenario: Нельзя добавлять категории, ставить на главную и добавлять в рассылку уже существующий баннер
        Given I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | false      | false   | null       |  
        When I change banner with:
            | on_main | in_mailing | categories |  
            | true    | true       | [1, 2]       |  
        Then response status is 400


    Scenario: Нельзя разместить баннер на главную, если уже существует баннер на главной
        And I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | false      | true    | null       |  

        When I change banner with:
            | in_mailing |  
            | true       |  

        Then response status is 400

    Scenario: Нельзя разместить баннер в рассылку, если он уже размещен в категориях
        And I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | false      | false   | [1, 2]     |  

        When I change banner with:
            | in_mailing |  
            | true       |  
        Then response status is 400

    Scenario: Нельзя разместить баннер на главную, если он уже в рассылке
        And I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | true      | false   | null     |  


        When I change banner with:
            | on_main |  
            | true    |  
        Then response status is 400

    Scenario: Нельзя добавить категории к баннеру, если он уже в рассылке
        And I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | true      | false   | null     |  

        When I change banner with:
            | categories |  
            | [1, 2]     |  
        Then response status is 400
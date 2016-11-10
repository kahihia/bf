Feature: Superbanner display area

    Background:
        Given I am an advertiser
        And I have moderated merchant
        And there is uploaded image in system with id=42
        And there are categories with:
            |id|
            |1|
            |2|


    Scenario: Advertiser cant create banner on main or in categories and in mailing same time
        Given I am logged in
        When I create banner with:
            | on_main | in_mailing |  
            | true    | true       |  
        Then response status is 400
        When I create banner with:
            | in_mailing | categories |  
            | true       | [1, 2]    |  
        Then response status is 400
        When I create banner with:
            | on_main | in_mailing | categories |  
            | true    | true       | [1, 2]       |  
        Then response status is 400

    Scenario: Advertiser cant change banner on main or in categories and in mailing same time
        Given I am logged in
        And I have banner:
            | type    | in_mailing | on_main | categories |  
            | "super" | false      | false   | null       |  
        When I change banner with:
            | on_main | in_mailing |  
            | true    | true       |  
        Then response status is 400
        When I change banner with:
            | in_mailing | categories |  
            | true       | [1, 2]    |  
        Then response status is 400
        When I change banner with:
            | on_main | in_mailing | categories |  
            | true    | true       | [1, 2]       |  
        Then response status is 400

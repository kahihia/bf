Feature: Неизменяемость бывшего в рассылке баннера

    Background:
        Given I am an advertiser
        And I have moderated merchant
        And I have banner:
            | type    | was_mailed |  
            | "super" | true       |  
    Scenario: Нельзя менять баннер, который уже был в рассылке
        Given I am logged in
        When I change banner with:
            | on_main | 
            | true    | 
        Then response status is 403

    Scenario: Нельзя удалять баннер, который уже был в рассылке
        Given I am logged in
        When I delete banner
        Then response status is 403

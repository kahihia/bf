Feature: Superbanner only on mailing or im main

Scenario: Bad response if send in_mailing and on_main
    Given I am an advertiser
    And I am logged in
    And I have moderated merchant with id=42
    And I have banners:
        | type    | id | in_mailing | on_main |  
        | "super" | 1  | false      | false   |  
        | "super" | 2  | true       | false   |  
        | "super" | 3  | false      | true    |  

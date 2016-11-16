Feature: Merchant moderation reset

Scenario: Reset on successfull change of text fields
    Given I am an advertiser
    And I am logged in
    And I have moderated merchant
    When I change <field> to <value>
    Then moderation_status is <moderation_status>

    Examples:
    | field       | value                  | moderation_status |  
    | name        | foo                    | 0                 |  
    | description | bar                    | 0                 |  
    | url         | https://www.yandex.ru/ | 0                 |  
    | promocode   | testcode               | 0                 |  



Scenario: Reset on successfull change of image
    Given I am an advertiser
    And I am logged in
    And I have moderated merchant
    And there is uploaded image in system with id=<image_id>
    When I change <field> to <value>
    Then moderation_status is <moderation_status>

    Examples:
    | image_id | field | value | moderation_status |  
    | 42       | image | 42    | 0                 |  


Scenario: Not reset on change of system fields
    Given I am an admin
    And I am logged in
    And I have moderated merchant
    When I change <field> to <value>
    Then moderation_status is <moderation_status>

    Examples:
    | field | value | moderation_status |  
    | slug  | slug  | 2                 |  

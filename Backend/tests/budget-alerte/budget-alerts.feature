Feature: Alerte de dépassement de budget
  
  Scenario: Alerte lorsque le budget atteint 80%
    Given un budget de 300€ pour "Alimentation" du 2026-01-01 au 2026-01-31
    And des dépenses totales de 250€ dans "Alimentation" en janvier
    When je consulte les alertes budgétaires
    Then je dois voir une alerte "WARNING" pour "Alimentation"
    And le message doit indiquer "83.33% consommé"

  Scenario: Alerte lorsque le budget est dépassé
    Given un budget de 300€ pour "Alimentation" du 2026-01-01 au 2026-01-31
    And des dépenses totales de 310€ dans "Alimentation" en janvier
    When je consulte les alertes budgétaires
    Then je dois voir une alerte "OVER_BUDGET" pour "Alimentation"
    And le montant de dépassement doit être de 10€

  Scenario: Alerte lors de l'ajout d'une transaction qui fait dépasser
    Given un budget de 300€ pour "Alimentation" du 2026-01-01 au 2026-01-31
    And des dépenses existantes de 290€ dans "Alimentation"
    When j'ajoute une dépense de 20€ dans "Alimentation"
    Then la transaction doit être créée
    And une alerte doit être retournée indiquant le dépassement de 10€
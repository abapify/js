interface ZIF_PETSTORE
  public .

  "test comment

  types:
    begin of ty_pet,
      id       type i,
      name     type string,
      category type string,
      status   type string,
    end of ty_pet,
    
    tt_pets type table of ty_pet with empty key.

  methods:
    get_pet
      importing
        iv_pet_id type i
      returning
        value(rs_pet) type ty_pet
      raising
        cx_abap_invalid_value,
        
    create_pet
      importing
        is_pet type ty_pet
      returning
        value(rv_pet_id) type i
      raising
        cx_abap_invalid_value,
        
    update_pet
      importing
        is_pet type ty_pet
      raising
        cx_abap_invalid_value,
        
    delete_pet
      importing
        iv_pet_id type i
      raising
        cx_abap_invalid_value,
        
    list_pets
      importing
        iv_status type string optional
      returning
        value(rt_pets) type tt_pets.

endinterface.

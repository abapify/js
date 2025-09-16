class ZCL_PETSTORE_IMPL definition
  public
  final
  create public .

  public section.
    interfaces ZIF_PETSTORE .
  protected section.
  private section.
    types:
      begin of ty_pet_storage,
        id       type i,
        name     type string,
        category type string,
        status   type string,
      end of ty_pet_storage,
      tt_pet_storage type table of ty_pet_storage with unique key id.

    data: mt_pets type tt_pet_storage,
          mv_next_id type i value 1.
endclass.

class ZCL_PETSTORE_IMPL implementation.
  method zif_petstore~create_pet.
    data: ls_pet_storage type ty_pet_storage.
    
    if is_pet-name is initial.
      raise exception type cx_abap_invalid_value
        exporting
          value = 'Pet name cannot be empty'.
    endif.
    
    ls_pet_storage-id = mv_next_id.
    ls_pet_storage-name = is_pet-name.
    ls_pet_storage-category = is_pet-category.
    ls_pet_storage-status = is_pet-status.
    
    if ls_pet_storage-status is initial.
      ls_pet_storage-status = 'available'.
    endif.
    
    insert ls_pet_storage into table mt_pets.
    rv_pet_id = mv_next_id.
    mv_next_id = mv_next_id + 1.
  endmethod.

  method zif_petstore~delete_pet.
    delete mt_pets where id = iv_pet_id.
    if sy-subrc <> 0.
      raise exception type cx_abap_invalid_value
        exporting
          value = |Pet with ID { iv_pet_id } not found|.
    endif.
  endmethod.

  method zif_petstore~get_pet.
    read table mt_pets into data(ls_pet_storage) with key id = iv_pet_id.
    if sy-subrc <> 0.
      raise exception type cx_abap_invalid_value
        exporting
          value = |Pet with ID { iv_pet_id } not found|.
    endif.
    
    rs_pet-id = ls_pet_storage-id.
    rs_pet-name = ls_pet_storage-name.
    rs_pet-category = ls_pet_storage-category.
    rs_pet-status = ls_pet_storage-status.
  endmethod.

  method zif_petstore~list_pets.
    loop at mt_pets into data(ls_pet_storage).
      if iv_status is not initial and ls_pet_storage-status <> iv_status.
        continue.
      endif.
      
      append value #( 
        id = ls_pet_storage-id
        name = ls_pet_storage-name
        category = ls_pet_storage-category
        status = ls_pet_storage-status
      ) to rt_pets.
    endloop.
  endmethod.

  method zif_petstore~update_pet.
    read table mt_pets assigning field-symbol(<ls_pet>) with key id = is_pet-id.
    if sy-subrc <> 0.
      raise exception type cx_abap_invalid_value
        exporting
          value = |Pet with ID { is_pet-id } not found|.
    endif.
    
    if is_pet-name is not initial.
      <ls_pet>-name = is_pet-name.
    endif.
    if is_pet-category is not initial.
      <ls_pet>-category = is_pet-category.
    endif.
    if is_pet-status is not initial.
      <ls_pet>-status = is_pet-status.
    endif.
  endmethod.
endclass.

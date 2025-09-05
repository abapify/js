INTERFACE zif_petstore
  PUBLIC .

  TYPES:
    "! Pet status enumeration
    BEGIN OF ty_pet_status,
      available TYPE string VALUE 'available',
      pending   TYPE string VALUE 'pending',
      sold      TYPE string VALUE 'sold',
    END OF ty_pet_status.

  TYPES:
    "! Pet data structure
    BEGIN OF ty_pet,
      id       TYPE string,
      name     TYPE string,
      status   TYPE string,
      category TYPE string,
      tags     TYPE string_table,
    END OF ty_pet.

  TYPES:
    "! Order data structure
    BEGIN OF ty_order,
      id       TYPE string,
      pet_id   TYPE string,
      quantity TYPE i,
      ship_date TYPE dats,
      status   TYPE string,
      complete TYPE abap_bool,
    END OF ty_order.

  METHODS:
    "! Get pet by ID
    "! @parameter iv_pet_id | Pet ID to retrieve
    "! @parameter ev_pet_data | Pet data in JSON format
    "! @raising zcx_petstore_not_found | Pet not found exception
    get_pet_by_id
      IMPORTING
        iv_pet_id TYPE string
      EXPORTING
        ev_pet_data TYPE string
      RAISING
        zcx_petstore_not_found,

    "! Create a new pet
    "! @parameter iv_pet_data | Pet data in JSON format
    "! @parameter ev_pet_id | Generated pet ID
    "! @raising zcx_petstore_invalid_data | Invalid pet data exception
    create_pet
      IMPORTING
        iv_pet_data TYPE string
      EXPORTING
        ev_pet_id TYPE string
      RAISING
        zcx_petstore_invalid_data,

    "! Update an existing pet
    "! @parameter iv_pet_id | Pet ID to update
    "! @parameter iv_pet_data | Updated pet data in JSON format
    "! @raising zcx_petstore_not_found | Pet not found exception
    "! @raising zcx_petstore_invalid_data | Invalid pet data exception
    update_pet
      IMPORTING
        iv_pet_id TYPE string
        iv_pet_data TYPE string
      RAISING
        zcx_petstore_not_found
        zcx_petstore_invalid_data,

    "! Delete a pet
    "! @parameter iv_pet_id | Pet ID to delete
    "! @raising zcx_petstore_not_found | Pet not found exception
    delete_pet
      IMPORTING
        iv_pet_id TYPE string
      RAISING
        zcx_petstore_not_found,

    "! Get pets by status
    "! @parameter iv_status | Pet status filter (available, pending, sold)
    "! @parameter et_pets | List of pets matching status
    get_pets_by_status
      IMPORTING
        iv_status TYPE string
      EXPORTING
        et_pets TYPE string_table,

    "! Place an order for a pet
    "! @parameter iv_order_data | Order data in JSON format
    "! @parameter ev_order_id | Generated order ID
    "! @raising zcx_petstore_invalid_data | Invalid order data exception
    place_order
      IMPORTING
        iv_order_data TYPE string
      EXPORTING
        ev_order_id TYPE string
      RAISING
        zcx_petstore_invalid_data,

    "! Get order by ID
    "! @parameter iv_order_id | Order ID to retrieve
    "! @parameter ev_order_data | Order data in JSON format
    "! @raising zcx_petstore_not_found | Order not found exception
    get_order_by_id
      IMPORTING
        iv_order_id TYPE string
      EXPORTING
        ev_order_data TYPE string
      RAISING
        zcx_petstore_not_found.

ENDINTERFACE.

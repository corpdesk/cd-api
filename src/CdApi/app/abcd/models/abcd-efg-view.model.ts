import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "abcd_efg_view",
  /**
   * This is managed by Corpdesk engine so that when
   * typeorm is not implemented, the process continues without
   * dependency on typorm
   */
  synchronize: false,
  /**
   * The expression below can be auto-generated from
   * cd-cli or cd-ai
   */
  expression: `
        SELECT 
            'abcd_efg'.'abcd_efg_id' AS 'abcd_efg_id',
            'abcd_efg'.'abcd_efg_guid' AS 'abcd_efg_guid',
            'abcd_efg'.'abcd_efg_name' AS 'abcd_efg_name',
            'abcd_efg'.'coop_active' AS 'coop_active',
            'abcd_efg'.'abcd_efg_enabled' AS 'abcd_efg_enabled',
            'abcd_efg'.'abcd_efg_profile' AS 'abcd_efg_profile',
            'abcd_efg_type'.'abcd_efg_type_id' AS 'abcd_efg_type_id',
            'abcd_efg_type'.'abcd_efg_type_guid' AS 'abcd_efg_type_guid',
            'user'.'user_id' AS 'user_id',
            'user'.'user_guid' AS 'user_guid',
            'user'.'user_name' AS 'user_name',
            'user'.'email' AS 'email',
            'user'.'mobile' AS 'mobile',
            'user'.'gender' AS 'gender',
            'user'.'birth_date' AS 'birth_date',
            'user'.'postal_addr' AS 'postal_addr',
            'user'.'f_name' AS 'f_name',
            'user'.'m_name' AS 'm_name',
            'user'.'l_name' AS 'l_name',
            'user'.'national_id' AS 'national_id',
            'user'.'passport_id' AS 'passport_id',
            'user'.'user_enabled' AS 'user_enabled',
            'user'.'zip_code' AS 'zip_code',
            'user'.'activation_key' AS 'activation_key',
            'user'.'user_type_id' AS 'user_type_id',
            'coop_view'.'coop_id' AS 'coop_id',
            'coop_view'.'coop_guid' AS 'coop_guid',
            'coop_view'.'coop_name' AS 'coop_name',
            'coop_view'.'company_id' AS 'company_id',
            'coop_view'.'company_name' AS 'company_name',
            'coop_view'.'company_type_id' AS 'company_type_id',
            'coop_view'.'cd_geo_location_id' AS 'cd_geo_location_id',
            'coop_view'.'cd_geo_location_name' AS 'cd_geo_location_name',
            'coop_view'.'cd_geo_political_type_name' AS 'cd_geo_political_type_name',
            'coop_view'.'cd_geo_political_parent_id' AS 'cd_geo_political_parent_id'
        FROM
            'abcd_efg'
            JOIN 'user' ON 'abcd_efg'.'user_id' = 'user'.'user_id'
            JOIN 'abcd_efg_type' ON 'abcd_efg'.'abcd_efg_type_id' = 'abcd_efg_type'.'abcd_efg_type_id'
            JOIN 'coop_view' ON 'abcd_efg'.'coop_id' = 'coop_view'.'coop_id'
    `,
})
export class AbcdEfgViewModel {
  @ViewColumn({ name: "abcd_efg_id" })
  abcdEfgId?: number;

  @ViewColumn({ name: "abcd_efg_guid" })
  abcdEfgGuid?: string;

  @ViewColumn({ name: "abcd_efg_name" })
  abcdEfgName?: string;

  @ViewColumn({ name: "abcd_efg_enabled" })
  abcdEfgEnabled?: boolean;

  @ViewColumn({ name: "abcd_efg_type_id" })
  abcdEfgTypeId?: number;

  @ViewColumn({ name: "abcd_efg_type_guid" })
  abcdEfgTypeGuid?: string;

  @ViewColumn({ name: "coop_active" })
  coopActive?: boolean;

  @ViewColumn({ name: "abcd_efg_profile" })
  abcdEfgProfile?: string;

  @ViewColumn({ name: "user_id" })
  userId?: number;

  @ViewColumn({ name: "user_guid" })
  userGuid?: string;

  @ViewColumn({ name: "user_name" })
  userName?: string;

  @ViewColumn({ name: "email" })
  email?: string;

  @ViewColumn({ name: "mobile" })
  mobile?: string;

  @ViewColumn({ name: "gender" })
  gender?: string;

  @ViewColumn({ name: "birth_date" })
  birthDate?: Date;

  @ViewColumn({ name: "postal_addr" })
  postalAddr?: string;

  @ViewColumn({ name: "f_name" })
  fName?: string;

  @ViewColumn({ name: "m_name" })
  mName?: string;

  @ViewColumn({ name: "l_name" })
  lName?: string;

  @ViewColumn({ name: "national_id" })
  nationalId?: string;

  @ViewColumn({ name: "passport_id" })
  passportId?: string;

  @ViewColumn({ name: "user_enabled" })
  userEnabled?: boolean;

  @ViewColumn({ name: "zip_code" })
  zipCode?: string;

  @ViewColumn({ name: "activation_key" })
  activationKey?: string;

  @ViewColumn({ name: "user_type_id" })
  userTypeId?: number;

  @ViewColumn({ name: "coop_id" })
  coopId?: number;

  @ViewColumn({ name: "coop_guid" })
  coopGuid?: string;

  @ViewColumn({ name: "coop_name" })
  coopName?: string;

  @ViewColumn({ name: "company_id" })
  companyId?: number;

  @ViewColumn({ name: "company_name" })
  companyName?: string;

  @ViewColumn({ name: "company_type_id" })
  companyTypeId?: number;

  @ViewColumn({ name: "cd_geo_location_id" })
  cdGeoLocationId?: number;

  @ViewColumn({ name: "cd_geo_location_name" })
  cdGeoLocationName?: string;

  @ViewColumn({ name: "cd_geo_political_type_name" })
  cdGeoPoliticalTypeName?: string;

  @ViewColumn({ name: "cd_geo_political_parent_id" })
  cdGeoPoliticalParentId?: number;
}

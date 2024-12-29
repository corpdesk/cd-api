import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "cd_cli_profile_view",
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
            'cd_cli_profile'.'cd_cli_profile_id' AS 'cd_cli_profile_id',
            'cd_cli_profile'.'cd_cli_profile_guid' AS 'cd_cli_profile_guid',
            'cd_cli_profile'.'cd_cli_profile_name' AS 'cd_cli_profile_name',
            'cd_cli_profile'.'coop_active' AS 'coop_active',
            'cd_cli_profile'.'cd_cli_profile_enabled' AS 'cd_cli_profile_enabled',
            'cd_cli_profile'.'cd_cli_profile_profile' AS 'cd_cli_profile_profile',
            'cd_cli_profile_type'.'cd_cli_profile_type_id' AS 'cd_cli_profile_type_id',
            'cd_cli_profile_type'.'cd_cli_profile_type_guid' AS 'cd_cli_profile_type_guid',
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
            'cd_cli_profile'
            JOIN 'user' ON 'cd_cli_profile'.'user_id' = 'user'.'user_id'
            JOIN 'cd_cli_profile_type' ON 'cd_cli_profile'.'cd_cli_profile_type_id' = 'cd_cli_profile_type'.'cd_cli_profile_type_id'
            JOIN 'coop_view' ON 'cd_cli_profile'.'coop_id' = 'coop_view'.'coop_id'
    `,
})
export class CdCliProfileViewModel {
  @ViewColumn({ name: "cd_cli_profile_id" })
  cdCliProfileId?: number;

  @ViewColumn({ name: "cd_cli_profile_guid" })
  cdCliProfileGuid?: string;

  @ViewColumn({ name: "cd_cli_profile_name" })
  cdCliProfileName?: string;

  @ViewColumn({ name: "cd_cli_profile_enabled" })
  cdCliProfileEnabled?: boolean;

  @ViewColumn({ name: "cd_cli_profile_type_id" })
  cdCliProfileTypeId?: number;

  @ViewColumn({ name: "cd_cli_profile_type_guid" })
  cdCliProfileTypeGuid?: string;

  @ViewColumn({ name: "user_id" })
  userId?: number;
}

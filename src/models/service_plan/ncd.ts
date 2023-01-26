import { Knex } from 'knex'

export class SPNCDModel {

  constructor () { }

  screening(db: Knex) {
    const sql = `
      select
        CASE
          when left(
            areacode,
            2
          ) = '40' THEN 'ขอนแก่น'
          when left(
            areacode,
            2
          ) = '44' THEN 'มหาสารคาม'
          when left(
            areacode,
            2
          ) = '45' THEN 'ร้อยเอ็ด'
          when left(
            areacode,
            2
          ) = '46' THEN 'กาฬสินธุ์'
        END as province_name,
        left(
          areacode,
          2
        ) as province_code,
        sum(target) as target,
        sum(result) as result,
        sum(result1) as result1,
        sum(result2) as result2,
        sum(result3) as result3,
        sum(result4) as result4
      from
        s_dm_screen
      group by
        province_code
      order by
        province_code;
    `

    return db.raw(sql)
  }

}

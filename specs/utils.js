import { utils, Log, Model } from 'decentraland-commons'

export function omitProps(obj, omittedProps) {
  const newObj = utils.omit(obj, omittedProps)

  for (const prop in newObj) {
    const value = newObj[prop]
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        newObj[prop] = value.map(v => omitProps(v, omittedProps))
      } else {
        newObj[prop] = omitProps(value, omittedProps)
      }
    }
  }

  return newObj
}

export function mockModelDbOperations(operations) {
  const log = new Log('Query')
  const toJSON = obj => JSON.stringify(obj) // Formatting aid

  const _query = Model.db.query
  const _count = Model.db.count

  operations = {
    query: async function(query, args) {
      const rows = await _query.call(this, query, args)

      if (query.values) {
        args = query.values
        query = query.text
      }

      log.info(
        `Executing:\n${query} values ${toJSON(args)} => ${rows.length} rows`
      )
      return rows
    },
    count: async function(tableName, conditions) {
      const count = await _count.call(this, tableName, conditions)
      log.info(
        `Counting: ${toJSON(conditions)} on ${tableName} => ${toJSON(count)}`
      )
      return count
    },
    insert: (tableName, row) => {
      log.info(`Inserting: ${toJSON(row)} on ${tableName}`)
      return { rows: [{}] }
    },
    update: (tableName, changes, conditions) =>
      log.info(
        `Updating: ${toJSON(conditions)} with ${toJSON(
          changes
        )} on ${tableName}`
      ),
    delete: (tableName, conditions) =>
      log.info(`Deleting: ${toJSON(conditions)} on ${tableName}`),
    ...operations
  }

  Model.db.query = function(...args) {
    return operations.query.call(this, ...args)
  }
  Model.db.count = function(...args) {
    return operations.count.call(this, ...args)
  }
  Model.db.insert = function(...args) {
    return operations.insert.call(this, ...args)
  }
  Model.db.update = function(...args) {
    return operations.update.call(this, ...args)
  }
  Model.db.delete = function(...args) {
    return operations.delete.call(this, ...args)
  }
}

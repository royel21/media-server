const SortFunc = `
CREATE FUNCTION REGEX_STRING
RETURNS int
LANGUAGE SQL
DETERMINISTIC
NO SQL
SQL SECURITY INVOKER
BEGIN
	RETURN '^\\d*[^\\da-z&\\.\\\' \\-\\"\\!\\@\\#\\$\\%\\^\\*\\(\\)\\;\\:\\\\,\\?\\/\\~\\\`\\|\\_\\-]'
END
`;

const createFuncs = async ({ sqlze, QueryTypes }) => {
  await sqlze.query(`DROP FUNCTION IF EXISTS REGEX_STRING;`, {
    type: QueryTypes.RAW,
  });

  await sqlze.query(SortFunc, {
    type: QueryTypes.RAW,
  });
};

module.exports = {
  createFuncs,
};

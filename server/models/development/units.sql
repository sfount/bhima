UPDATE unit SET path = '/references' WHERE id = 112;
UPDATE unit SET path = '/references/groups' WHERE id = 111;

UPDATE unit SET path = '/purchases' WHERE id = 53;
UPDATE unit SET path = '/purchases/confirm' WHERE id = 71;
UPDATE unit SET path = '/purchases/authorization' WHERE id = 99;
UPDATE unit SET path = '/purchases/validate' WHERE id = 98;

UPDATE unit SET path = '/creditors/groups' WHERE id = 23;

update unit set path = '/exchange' WHERE id = 22;
update unit set path = '/projects' WHERE id = 42;
update unit set path = '/services' WHERE id = 48;

update unit set path = '/accounts' WHERE id = 6;

update unit set path = '/journal/voucher' WHERE id = 41;

update unit set path = '/employees' WHERE id = 61;
update unit set path = '/employees/fonction' WHERE id = 60;
update unit set path = '/employees/grades' WHERE id = 59;
update unit set path = '/employees/offdays' WHERE id = 64;
update unit set path = '/employees/holidays' WHERE id = 65;


update unit set path = '/budgets' WHERE id = 51;
update unit set path = '/budgets/analysis' WHERE id = 117;
update unit set path = '/budgets/update' where id = 7;
update unit set path = '/budgets/create' where id = 131;


update unit set path = '/debtors/groups' WHERE id = 24;
update unit set path = '/creditors' WHERE id = 19;
update unit set path = '/creditors/groups' where id = 23;


update unit set path = '/donors' where id = 20;
update unit set path = '/donations/confirm' where id = 101;

update unit set path = '/sales/records' where id = 17;
update unit set path = '/cash/records' where id = 34;

update unit set path = '/patients/edit' where id = 80;
update unit set path = '/patients/debtor' where id = 36;
update unit set path = '/patients/register' where id = 14;
update unit set path = '/patients/search' where id = 15;
update unit set path = '/patients/groups/assignment' where id = 28;
update unit set path = '/patients/groups' where id = 29;

update unit set path = '/statistics' where id = 69;
-- update unit set path = '/snis/create' where id = 29;
-- update unit set path = '/snis/update' where id = 29;


update unit set path = '/permissions' where id = 4;

update unit set path = '/enterprises' where id = 2;

update unit set path = '/locations' where id = 26;

update unit set path = '/subsidies' where id = 82;

update unit set path = '/taxes' where id = 62;

-- reports/tfr is never used
delete from unit where id = 88;

-- move payroll reports into reports
update unit set parent = 126 where id = 118;
update unit set parent = 126 where id = 119;
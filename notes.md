### PREVENTING UNDERFETCHING AND OVERFETCHING IN PRISMA QUERIES
1. Use the omit --- to omit fetching something from a query. Prisma returns all scalar fieds for the requested model without related fields.
2. Use select to attach fields you want in the requested model.
3. Use include to include all the related fields from a requested modal.
The select and include keywords should not be used at the same level. Select should be used inside the include. 
Select should be avoided when making dynamic queries because it can affect static typing.

-- One can't use both select and include


## NB
The encodeURIComponent is used to encode a hash(generated from cryto lib) into a readable string by the browser.

TODOS:
1. Hash the verification token
2. Decode the verification token when verifying the token sent to the user

Points: -- When hashing the verificatino token you can't fetch for it using the token from req.query because its raw and the 
one in the database is hashed. One should the userId associated with that token and compare it using the compare method from bcrypt.

#!/usr/bin/env bash
# Popula a API local com dados de demonstração.
# Login admin: CNPJ 98765432000110 / admin@demo.com / demo12345
# Login fisio: fisio@demo.com / demo12345
set -euo pipefail
API=${API:-http://localhost:8080/api/v1}
j() { curl -sf -H 'Content-Type: application/json' "$@"; }

TOKEN=$(j -X POST "$API/auth/register-clinic" -d '{"clinicName":"Clínica Demo","cnpj":"98765432000110","adminName":"Ana Admin","adminEmail":"admin@demo.com","adminPassword":"demo12345"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
AUTH="Authorization: Bearer $TOKEN"

j -H "$AUTH" -X POST "$API/professionals" -d '{"name":"Bruno Fisio","email":"fisio@demo.com","password":"demo12345","specialty":"Ortopedia","licenseNumber":"CREFITO-3 123456-F"}' >/dev/null
j -H "$AUTH" -X POST "$API/professionals" -d '{"name":"Carla Souza","email":"carla@demo.com","password":"demo12345","specialty":"Neurologia","licenseNumber":"CREFITO-3 654321-F"}' >/dev/null
for p in 'João Silva|11122233344' 'Maria Oliveira|55566677788' 'Pedro Santos|99988877766'; do
  j -H "$AUTH" -X POST "$API/patients" -d "{\"name\":\"${p%|*}\",\"cpf\":\"${p#*|}\",\"phone\":\"(11) 99999-0000\",\"insuranceName\":\"Unimed\"}" >/dev/null
done
echo "Dados de demonstração criados."

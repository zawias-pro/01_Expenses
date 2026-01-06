import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { parseCSVLine } from '../parsing/parseCSVLine/parseCSVLine.ts'
import { processTransactions } from '../parsing/processTransactions/processTransactions.ts'
import { parseRules } from '../parsing/parseRules/parseRules.ts'
import { getCategories } from '../parsing/getCategories/getCategories.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import type { Transaction, MonthlySummary } from '../parsing/types.ts'
import { CSVInputPreview } from '../views/input/CSVInputPreview.tsx'
import { TransactionsTable } from '../views/table/TransactionsTable.tsx'
import { DataByPeriod } from '../views/data-by-period/DataByPeriod.tsx'
import { CumulativeBarChart } from '../views/data-cumulative/CumulativeBarChart.tsx'
import { Categories } from '../views/categories/Categories.tsx'
import rulesContent from '../rules.csv?raw'

const INITIAL_CSV = `2025-12-12;"JAN ADAM KOWALSKI, CZYNSZ NAJMU                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     74899274659992743764666621  ";"MojBank 1234 ... 5678";"Czynsz i wynajem";-5 000,00 PLN;;
2025-12-01;"BIEDRONKA SPÓŁKA Z O.O.                                                                                  ZAKUP PRZY UŻYCIU KARTY                                                             12345678901234567890123456  ";"MojBank 1234 ... 5678";"Żywność i napoje";-89,50 PLN;;
2025-12-02;"ORLEN PALIWA SP. Z O.O.                                                                                ZAKUP PRZY UŻYCIU KARTY                                                             23456789012345678901234567  ";"MojBank 1234 ... 5678";"Transport";-120,00 PLN;;
2025-12-03;"TAURON POLSKA ENERGIA S.A.                                                                          PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-250,00 PLN;;
2025-12-05;"NETFLIX.COM                                                                                          ZAKUP PRZY UŻYCIU KARTY - INTERNET                                                  45678901234567890123456789  ";"MojBank 1234 ... 5678";"Rozrywka i kultura";-49,90 PLN;;
2025-12-07;"LIDL POLSKA SP. Z O.O.                                                                               ZAKUP PRZY UŻYCIU KARTY                                                             56789012345678901234567890  ";"MojBank 1234 ... 5678";"Żywność i napoje";-156,30 PLN;;
2025-12-10;"PKP INTERCITY SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             67890123456789012345678901  ";"MojBank 1234 ... 5678";"Transport";-89,00 PLN;;
2025-12-12;"EMPIRIA SP. Z O.O.                                                                                   ZAKUP PRZY UŻYCIU KARTY                                                             78901234567890123456789012  ";"MojBank 1234 ... 5678";"Zdrowie i higiena";-45,80 PLN;;
2025-12-15;"MEDIA MARKT SP. Z O.O.                                                                              ZAKUP PRZY UŻYCIU KARTY                                                             89012345678901234567890123  ";"MojBank 1234 ... 5678";"Dom i ogród";-299,99 PLN;;
2025-12-18;"ZUS - WYPLATA EMERYTURY                                                                             PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";1 200,00 PLN;;
2025-12-20;"PLAY SP. Z O.O.                                                                                     PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     01234567890123456789012345  ";"MojBank 1234 ... 5678";"Telekomunikacja";-39,99 PLN;;
2025-12-22;"CARREFOUR POLSKA SP. Z O.O.                                                                        ZAKUP PRZY UŻYCIU KARTY                                                             12345678901234567890123456  ";"MojBank 1234 ... 5678";"Żywność i napoje";-234,67 PLN;;
2025-12-25;"ORANGE POLSKA S.A.                                                                                  PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     23456789012345678901234567  ";"MojBank 1234 ... 5678";"Telekomunikacja";-59,99 PLN;;
2025-12-28;"SHELL POLSKA SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             34567890123456789012345678  ";"MojBank 1234 ... 5678";"Transport";-150,00 PLN;;
2025-11-18;"ALA MAKOTA, PLATNOSC                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     73829917394502917062843947  ";"MojBank 1234 ... 5678";"Bez kategorii";-450,00 PLN;;
2025-11-02;"AUCHAN POLSKA SP. Z O.O.                                                                           ZAKUP PRZY UŻYCIU KARTY                                                             45678901234567890123456789  ";"MojBank 1234 ... 5678";"Żywność i napoje";-178,90 PLN;;
2025-11-05;"PKO BP S.A.                                                                                         WYPŁATA GOTÓWKOWA                                                                  56789012345678901234567890  ";"MojBank 1234 ... 5678";"Wypłaty gotówki";-200,00 PLN;;
2025-11-08;"DECATHLON POLSKA SP. Z O.O.                                                                       ZAKUP PRZY UŻYCIU KARTY                                                             67890123456789012345678901  ";"MojBank 1234 ... 5678";"Sport i rekreacja";-129,99 PLN;;
2025-11-12;"SPOTIFY AB                                                                                          ZAKUP PRZY UŻYCIU KARTY - INTERNET                                                  78901234567890123456789012  ";"MojBank 1234 ... 5678";"Rozrywka i kultura";-19,99 PLN;;
2025-11-15;"ROSSMANN SP. Z O.O.                                                                                ZAKUP PRZY UŻYCIU KARTY                                                             89012345678901234567890123  ";"MojBank 1234 ... 5678";"Zdrowie i higiena";-67,45 PLN;;
2025-11-18;"PRZELEW DO MAMY                                                                                     PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";-300,00 PLN;;
2025-11-22;"CINEMA CITY POLSKA SP. Z O.O.                                                                     ZAKUP PRZY UŻYCIU KARTY                                                             01234567890123456789012345  ";"MojBank 1234 ... 5678";"Rozrywka i kultura";-35,00 PLN;;
2025-11-25;"ING BANK ŚLĄSKI S.A.                                                                               PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";850,00 PLN;;
2025-11-28;"ZABKA POLSKA SP. Z O.O.                                                                           ZAKUP PRZY UŻYCIU KARTY                                                             23456789012345678901234567  ";"MojBank 1234 ... 5678";"Żywność i napoje";-23,80 PLN;;
2025-10-11;"Revolut**1234*  ZAKUP PRZY UŻYCIU KARTY - INTERNET                                                  transakcja nierozliczona";"MojBank 1234 ... 5678";"Opłaty i odsetki";-1500,00 PLN;;
2025-10-03;"KAUFLAND POLSKA MARKETY SP. Z O.O.                                                                ZAKUP PRZY UŻYCIU KARTY                                                             34567890123456789012345678  ";"MojBank 1234 ... 5678";"Żywność i napoje";-198,75 PLN;;
2025-10-07;"PEPCO POLSKA SP. Z O.O.                                                                           ZAKUP PRZY UŻYCIU KARTY                                                             45678901234567890123456789  ";"MojBank 1234 ... 5678";"Dom i ogród";-89,99 PLN;;
2025-10-10;"APTEKA GEMINI SP. Z O.O.                                                                         ZAKUP PRZY UŻYCIU KARTY                                                             56789012345678901234567890  ";"MojBank 1234 ... 5678";"Zdrowie i higiena";-156,20 PLN;;
2025-10-14;"UBER POLAND TECHNOLOGY SP. Z O.O.                                                                ZAKUP PRZY UŻYCIU KARTY                                                             67890123456789012345678901  ";"MojBank 1234 ... 5678";"Transport";-45,60 PLN;;
2025-10-18;"STARBUCKS COFFEE POLSKA SP. Z O.O.                                                               ZAKUP PRZY UŻYCIU KARTY                                                             78901234567890123456789012  ";"MojBank 1234 ... 5678";"Żywność i napoje";-28,50 PLN;;
2025-10-22;"VODAFONE POLSKA SP. Z O.O.                                                                       PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     89012345678901234567890123  ";"MojBank 1234 ... 5678";"Telekomunikacja";-49,99 PLN;;
2025-10-25;"H&M POLSKA SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             90123456789012345678901234  ";"MojBank 1234 ... 5678";"Odzież i obuwie";-189,90 PLN;;
2025-10-28;"PRZELEW OD PRZYJACIEŁA                                                                           PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   01234567890123456789012345  ";"MojBank 1234 ... 5678";"Przelew własny";150,00 PLN;;
2025-09-18;"ANNA NOWAK, PLATNOSC ZA SIERPIEN                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     37102029640000650201218148  ";"MojBank 1234 ... 5678";"Bez kategorii";-350,00 PLN;;
2025-09-02;"IKEA RETAIL SP. Z O.O.                                                                           ZAKUP PRZY UŻYCIU KARTY                                                             12345678901234567890123456  ";"MojBank 1234 ... 5678";"Dom i ogród";-499,99 PLN;;
2025-09-06;"BOOKER SP. Z O.O.                                                                                ZAKUP PRZY UŻYCIU KARTY                                                             23456789012345678901234567  ";"MojBank 1234 ... 5678";"Żywność i napoje";-67,30 PLN;;
2025-09-10;"PRZELEW DO RODZINY                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";-500,00 PLN;;
2025-09-14;"PRZELEW  TEST                    00-000 MIASTO                        PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   73628298163829405836289922  ";"MojBank 1234 ... 5678";"Przelew własny";2 241,61 PLN;;
2025-09-18;"AMAZON EU SARL                                                                                     ZAKUP PRZY UŻYCIU KARTY - INTERNET                                                  45678901234567890123456789  ";"MojBank 1234 ... 5678";"Dom i ogród";-89,99 PLN;;
2025-09-22;"T-MOBILE POLSKA S.A.                                                                              PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     56789012345678901234567890  ";"MojBank 1234 ... 5678";"Telekomunikacja";-29,99 PLN;;
2025-09-26;"CCC S.A.                                                                                          ZAKUP PRZY UŻYCIU KARTY                                                             67890123456789012345678901  ";"MojBank 1234 ... 5678";"Odzież i obuwie";-249,99 PLN;;
2025-09-30;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   78901234567890123456789012  ";"MojBank 1234 ... 5678";"Przelew własny";3 500,00 PLN;;
2025-08-15;;"MojBank 1234 ... 5678";"Bez kategorii";-200,00 PLN;;
2025-08-03;"TESCO POLSKA SP. Z O.O.                                                                          ZAKUP PRZY UŻYCIU KARTY                                                             89012345678901234567890123  ";"MojBank 1234 ... 5678";"Żywność i napoje";-145,67 PLN;;
2025-08-07;"ZOO ZAKŁADY FARMACEUTYCZNE POLPHARMA S.A.                                                       ZAKUP PRZY UŻYCIU KARTY                                                             90123456789012345678901234  ";"MojBank 1234 ... 5678";"Zdrowie i higiena";-23,40 PLN;;
2025-08-11;"BOLT OPERATIONS OÜ                                                                                ZAKUP PRZY UŻYCIU KARTY                                                             01234567890123456789012345  ";"MojBank 1234 ... 5678";"Transport";-18,90 PLN;;
2025-08-15;"MULTIKINO SP. Z O.O.                                                                             ZAKUP PRZY UŻYCIU KARTY                                                             12345678901234567890123456  ";"MojBank 1234 ... 5678";"Rozrywka i kultura";-42,00 PLN;;
2025-08-20;"MISSING AMOUNT TRANSACTION";"MojBank 1234 ... 5678";"Bez kategorii";;
2025-08-22;"PRZELEW NA WYPOCZYNEK                                                                             PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     23456789012345678901234567  ";"MojBank 1234 ... 5678";"Przelew własny";-800,00 PLN;;
2025-08-25;"INVALID AMOUNT TRANSACTION";"MojBank 1234 ... 5678";"Bez kategorii";invalid-amount;;
2025-08-28;"PRZELEW OD ZUS                                                                                    PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";950,00 PLN;;
2025-07-02;"LEROY MERLIN POLSKA SP. Z O.O.                                                                  ZAKUP PRZY UŻYCIU KARTY                                                             45678901234567890123456789  ";"MojBank 1234 ... 5678";"Dom i ogród";-345,67 PLN;;
2025-07-06;"PIZZA HUT POLSKA SP. Z O.O.                                                                     ZAKUP PRZY UŻYCIU KARTY                                                             56789012345678901234567890  ";"MojBank 1234 ... 5678";"Żywność i napoje";-67,80 PLN;;
2025-07-10;"PRZELEW DO BRATA                                                                                  PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";-200,00 PLN;;
2025-07-14;"CIRCLE K POLSKA SP. Z O.O.                                                                     ZAKUP PRZY UŻYCIU KARTY                                                             78901234567890123456789012  ";"MojBank 1234 ... 5678";"Transport";-95,00 PLN;;
2025-07-18;"EMPIRIA SP. Z O.O.                                                                               ZAKUP PRZY UŻYCIU KARTY                                                             89012345678901234567890123  ";"MojBank 1234 ... 5678";"Zdrowie i higiena";-78,90 PLN;;
2025-07-22;"PRZELEW OD MAMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";250,00 PLN;;
2025-07-26;"CASTOREUM SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             01234567890123456789012345  ";"MojBank 1234 ... 5678";"Odzież i obuwie";-159,99 PLN;;
2025-07-30;"PRZELEW NA PREZENTY                                                                              PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";-150,00 PLN;;
2025-06-03;"FRANCZYZA SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             23456789012345678901234567  ";"MojBank 1234 ... 5678";"Żywność i napoje";-123,45 PLN;;
2025-06-07;"PRZELEW DO SIostry                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";-300,00 PLN;;
2025-06-11;"INTERMARCHE POLSKA SP. Z O.O.                                                                  ZAKUP PRZY UŻYCIU KARTY                                                             45678901234567890123456789  ";"MojBank 1234 ... 5678";"Żywność i napoje";-98,76 PLN;;
2025-06-15;"PRZELEW OD TATY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   56789012345678901234567890  ";"MojBank 1234 ... 5678";"Przelew własny";400,00 PLN;;
2025-06-19;"BP POLSKA SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             67890123456789012345678901  ";"MojBank 1234 ... 5678";"Transport";-110,00 PLN;;
2025-06-23;"W.KRUK SP. Z O.O.                                                                               ZAKUP PRZY UŻYCIU KARTY                                                             78901234567890123456789012  ";"MojBank 1234 ... 5678";"Dom i ogród";-67,89 PLN;;
2025-06-27;"PRZELEW NA WYJAZD                                                                                 PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";-600,00 PLN;;
2025-05-02;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";3 200,00 PLN;;
2025-05-06;"ALDI STORES POLSKA SP. Z O.O.                                                                   ZAKUP PRZY UŻYCIU KARTY                                                             01234567890123456789012345  ";"MojBank 1234 ... 5678";"Żywność i napoje";-87,43 PLN;;
2025-05-10;"PRZELEW DO KOLEDZY                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";-100,00 PLN;;
2025-05-14;"MCDONALD'S POLSKA SP. Z O.O.                                                                    ZAKUP PRZY UŻYCIU KARTY                                                             23456789012345678901234567  ";"MojBank 1234 ... 5678";"Żywność i napoje";-34,50 PLN;;
2025-05-18;"PRZELEW OD SIOSTRY                                                                                PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";150,00 PLN;;
2025-05-22;"PLUS GSM SP. Z O.O.                                                                              PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     45678901234567890123456789  ";"MojBank 1234 ... 5678";"Telekomunikacja";-24,99 PLN;;
2025-05-26;"PRZELEW NA UBEZPIECZENIE                                                                          PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     56789012345678901234567890  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-89,00 PLN;;
2025-05-30;"PRZELEW OD BRATA                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";180,00 PLN;;
2025-04-03;"NETTO MARKEN-DISCOUNT SP. Z O.O.                                                                ZAKUP PRZY UŻYCIU KARTY                                                             78901234567890123456789012  ";"MojBank 1234 ... 5678";"Żywność i napoje";-76,54 PLN;;
2025-04-07;"PRZELEW DO MAMY                                                                                   PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";-250,00 PLN;;
2025-04-11;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";3 100,00 PLN;;
2025-04-15;"OBI POLSKA SP. Z O.O.                                                                            ZAKUP PRZY UŻYCIU KARTY                                                             01234567890123456789012345  ";"MojBank 1234 ... 5678";"Dom i ogród";-234,56 PLN;;
2025-04-19;"PRZELEW NA PODATEK                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     12345678901234567890123456  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-450,00 PLN;;
2025-04-23;"PRZELEW OD TATY                                                                                   PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   23456789012345678901234567  ";"MojBank 1234 ... 5678";"Przelew własny";350,00 PLN;;
2025-04-27;"PRZELEW NA RATĘ KREDYTU                                                                           PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-780,00 PLN;;
2025-03-02;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   45678901234567890123456789  ";"MojBank 1234 ... 5678";"Przelew własny";3 000,00 PLN;;
2025-03-06;"PRZELEW DO RODZINY                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     56789012345678901234567890  ";"MojBank 1234 ... 5678";"Przelew własny";-400,00 PLN;;
2025-03-10;"PRZELEW OD MAMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";200,00 PLN;;
2025-03-14;"PRZELEW NA UBEZPIECZENIE                                                                          PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     78901234567890123456789012  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-120,00 PLN;;
2025-03-18;"PRZELEW OD BRATA                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";220,00 PLN;;
2025-03-22;"PRZELEW DO SIostry                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";-180,00 PLN;;
2025-03-26;"PRZELEW OD SIOSTRY                                                                                PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   01234567890123456789012345  ";"MojBank 1234 ... 5678";"Przelew własny";160,00 PLN;;
2025-03-30;"PRZELEW NA WYPOCZYNEK                                                                             PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";-500,00 PLN;;
2025-02-03;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   23456789012345678901234567  ";"MojBank 1234 ... 5678";"Przelew własny";2 800,00 PLN;;
2025-02-07;"PRZELEW DO MAMY                                                                                   PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";-300,00 PLN;;
2025-02-11;"PRZELEW OD TATY                                                                                   PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   45678901234567890123456789  ";"MojBank 1234 ... 5678";"Przelew własny";280,00 PLN;;
2025-02-15;"PRZELEW NA RATĘ KREDYTU                                                                           PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     56789012345678901234567890  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-750,00 PLN;;
2025-02-19;"PRZELEW DO BRATA                                                                                  PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";-150,00 PLN;;
2025-02-23;"PRZELEW OD PRZYJACIEŁA                                                                            PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   78901234567890123456789012  ";"MojBank 1234 ... 5678";"Przelew własny";120,00 PLN;;
2025-02-27;"PRZELEW NA PREZENTY                                                                              PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";-200,00 PLN;;
2025-01-02;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";2 900,00 PLN;;
2025-01-06;"PRZELEW DO RODZINY                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     01234567890123456789012345  ";"MojBank 1234 ... 5678";"Przelew własny";-350,00 PLN;;
2025-01-10;"PRZELEW OD MAMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";240,00 PLN;;
2025-01-14;"PRZELEW NA UBEZPIECZENIE                                                                          PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     23456789012345678901234567  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-110,00 PLN;;
2025-01-18;"PRZELEW OD BRATA                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";190,00 PLN;;
2025-01-22;"PRZELEW DO SIostry                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     45678901234567890123456789  ";"MojBank 1234 ... 5678";"Przelew własny";-170,00 PLN;;
2025-01-26;"PRZELEW OD SIOSTRY                                                                                PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   56789012345678901234567890  ";"MojBank 1234 ... 5678";"Przelew własny";140,00 PLN;;
2025-01-30;"PRZELEW NA WYPOCZYNEK                                                                             PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";-450,00 PLN;;
2024-12-03;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   78901234567890123456789012  ";"MojBank 1234 ... 5678";"Przelew własny";2 750,00 PLN;;
2024-12-07;"PRZELEW DO MAMY                                                                                   PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";-280,00 PLN;;
2024-12-11;"PRZELEW OD TATY                                                                                   PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";260,00 PLN;;
2024-12-15;"PRZELEW NA RATĘ KREDYTU                                                                           PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     01234567890123456789012345  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-720,00 PLN;;
2024-12-19;"PRZELEW DO BRATA                                                                                  PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";-130,00 PLN;;
2024-12-23;"PRZELEW OD PRZYJACIEŁA                                                                            PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   23456789012345678901234567  ";"MojBank 1234 ... 5678";"Przelew własny";110,00 PLN;;
2024-12-27;"PRZELEW NA PREZENTY                                                                              PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";-180,00 PLN;;
2024-11-02;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   45678901234567890123456789  ";"MojBank 1234 ... 5678";"Przelew własny";2 600,00 PLN;;
2024-11-06;"PRZELEW DO RODZINY                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     56789012345678901234567890  ";"MojBank 1234 ... 5678";"Przelew własny";-320,00 PLN;;
2024-11-10;"PRZELEW OD MAMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";220,00 PLN;;
2024-11-14;"PRZELEW NA UBEZPIECZENIE                                                                          PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     78901234567890123456789012  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-95,00 PLN;;
2024-11-18;"PRZELEW OD BRATA                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";170,00 PLN;;
2024-11-22;"PRZELEW DO SIostry                                                                                PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     90123456789012345678901234  ";"MojBank 1234 ... 5678";"Przelew własny";-160,00 PLN;;
2024-11-26;"PRZELEW OD SIOSTRY                                                                                PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   01234567890123456789012345  ";"MojBank 1234 ... 5678";"Przelew własny";130,00 PLN;;
2024-11-30;"PRZELEW NA WYPOCZYNEK                                                                             PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     12345678901234567890123456  ";"MojBank 1234 ... 5678";"Przelew własny";-420,00 PLN;;
2024-10-03;"PRZELEW OD FIRMY                                                                                  PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   23456789012345678901234567  ";"MojBank 1234 ... 5678";"Przelew własny";2 450,00 PLN;;
2024-10-07;"PRZELEW DO MAMY                                                                                   PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     34567890123456789012345678  ";"MojBank 1234 ... 5678";"Przelew własny";-270,00 PLN;;
2024-10-11;"PRZELEW OD TATY                                                                                   PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   45678901234567890123456789  ";"MojBank 1234 ... 5678";"Przelew własny";240,00 PLN;;
2024-10-15;"PRZELEW NA RATĘ KREDYTU                                                                           PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     56789012345678901234567890  ";"MojBank 1234 ... 5678";"Opłaty i odsetki";-690,00 PLN;;
2024-10-19;"PRZELEW DO BRATA                                                                                  PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     67890123456789012345678901  ";"MojBank 1234 ... 5678";"Przelew własny";-120,00 PLN;;
2024-10-23;"PRZELEW OD PRZYJACIEŁA                                                                            PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   78901234567890123456789012  ";"MojBank 1234 ... 5678";"Przelew własny";100,00 PLN;;
2024-10-27;"PRZELEW NA PREZENTY                                                                              PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     89012345678901234567890123  ";"MojBank 1234 ... 5678";"Przelew własny";-160,00 PLN;;
invalid-date;"INVALID DATE TRANSACTION";"MojBank 1234 ... 5678";"Bez kategorii";-100,00 PLN;;`

const RULES = parseRules(rulesContent)

const STORAGE_KEY = 'expense-analyzer-data'

type View = 'csv' | 'categories' | 'transactions' | 'summary' | 'chart'

type SavedData = {
  transactions: Transaction[]
  view: View
  customRules: Record<string, string>
  csvAccepted: boolean
  selectedMonth: { year: number; month: number } | null
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  onlyShowOthers: boolean
}

const loadSavedData = (): SavedData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved)
    // Validate that it has the expected structure
    if (typeof parsed === 'object' && parsed !== null) {
      // Check for required fields (allow partial data for migration)
      if (Array.isArray(parsed.transactions) && 
          typeof parsed.view === 'string' &&
          typeof parsed.customRules === 'object' &&
          typeof parsed.csvAccepted === 'boolean') {
        // Provide defaults for column indices if not present (backward compatibility)
        return {
          ...parsed,
          dateIndex: typeof parsed.dateIndex === 'number' ? parsed.dateIndex : 0,
          descriptionIndex: typeof parsed.descriptionIndex === 'number' ? parsed.descriptionIndex : 1,
          amountIndex: typeof parsed.amountIndex === 'number' ? parsed.amountIndex : 4,
          onlyShowOthers: typeof parsed.onlyShowOthers === 'boolean' ? parsed.onlyShowOthers : false,
        } as SavedData
      }
    }
    return null
  } catch {
    return null
  }
}

const saveData = (data: SavedData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save data:', error)
  }
}

// Cache for initial data load (only loaded once per app lifecycle)
let cachedInitialData: SavedData | null | undefined = undefined

const getInitialData = (): SavedData | null => {
  if (cachedInitialData === undefined) {
    cachedInitialData = loadSavedData()
  }
  return cachedInitialData
}

const App = () => {
  // Load saved data only once on initialization
  const initialData = getInitialData()
  
  const [csvAccepted, setCsvAccepted] = useState<boolean>(() => {
    return initialData?.csvAccepted ?? false
  })
  const [view, setView] = useState<View>(() => {
    // Always start on CSV page if CSV is not accepted
    if (!initialData?.csvAccepted) {
      return 'csv' as const
    }
    return initialData?.view || 'csv'
  })
  // CSV content is ephemeral - not saved to localStorage
  const [csvContent, setCsvContent] = useState<string>('')
  const [delimiter, setDelimiter] = useState<string>(';')
  const [dateIndex, setDateIndex] = useState<number>(() => {
    return initialData?.dateIndex ?? 0
  })
  const [descriptionIndex, setDescriptionIndex] = useState<number>(() => {
    return initialData?.descriptionIndex ?? 1
  })
  const [amountIndex, setAmountIndex] = useState<number>(() => {
    return initialData?.amountIndex ?? 4
  })
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return initialData?.transactions ?? []
  })
  const [summaries, setSummaries] = useState<MonthlySummary[] | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(() => {
    return initialData?.selectedMonth ?? null
  })
  const [customRules, setCustomRules] = useState<Record<string, string>>(() => {
    return initialData?.customRules ?? {}
  })
  const [onlyShowOthers, setOnlyShowOthers] = useState<boolean>(() => {
    return initialData?.onlyShowOthers ?? false
  })

  // Merge base rules with custom rules (memoized to prevent infinite loops)
  const allRules = useMemo(() => ({ ...RULES, ...customRules }), [customRules])
  const categories = useMemo(() => getCategories(allRules), [allRules])

  // Reset view to CSV if CSV is not accepted
  useEffect(() => {
    if (!csvAccepted && view !== 'csv') {
      setView('csv')
    }
  }, [csvAccepted, view])

  // Re-classify transactions when rules change (only for non-overridden transactions)
  useEffect(() => {
    if (transactions.length > 0) {
      setTransactions(prev => prev.map(t => {
        if (t.overridden) {
          return t // Keep overridden categories
        }
        const newCategory = classifyDescription(t.description, allRules)
        if (t.category === newCategory) {
          return t // No change needed
        }
        return {
          ...t,
          category: newCategory
        }
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customRules])

  // Recalculate summaries when transactions or rules change
  useEffect(() => {
    if (transactions.length > 0) {
      const activeTransactions = transactions.filter(t => !t.excluded)
      if (activeTransactions.length > 0) {
        const result = processTransactions(activeTransactions, allRules)
        setSummaries(result)
        // Validate or set selected month
        if (result.length > 0) {
          if (selectedMonth === null) {
            // Set to first available month if not set
            setSelectedMonth({ year: result[0].year, month: result[0].month })
          } else {
            // Validate that the selected month exists in the summaries
            const monthExists = result.some(
              s => s.year === selectedMonth.year && s.month === selectedMonth.month
            )
            if (!monthExists) {
              // If selected month doesn't exist, set to first available
              setSelectedMonth({ year: result[0].year, month: result[0].month })
            }
          }
        }
      } else {
        // All transactions are excluded
        setSummaries([])
      }
    } else {
      setSummaries(null)
      setSelectedMonth(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, allRules])

  const handleSave = () => {
    const dataToSave: SavedData = {
      transactions,
      view,
      customRules,
      csvAccepted,
      selectedMonth,
      dateIndex,
      descriptionIndex,
      amountIndex,
      onlyShowOthers,
    }
    saveData(dataToSave)
  }

  const handleClear = () => {
    // Clear all localStorage data
    localStorage.removeItem(STORAGE_KEY)
    // Reset cache so next mount loads fresh
    cachedInitialData = null
    // Reset all state
    setCsvContent('')
    setDelimiter(';')
    setDateIndex(0)
    setDescriptionIndex(1)
    setAmountIndex(4)
    setTransactions([])
    setSummaries(null)
    setCustomRules({})
    setCsvAccepted(false)
    setView('csv')
    setSelectedMonth(null)
    setOnlyShowOthers(false)
  }

  const handleCsvAccept = () => {
    setCsvAccepted(true)
  }

  const handleFillExample = () => {
    setCsvContent(INITIAL_CSV)
  }

  // Auto-parse CSV when content changes
  useEffect(() => {
    if (csvContent.trim()) {
      const lines = csvContent.split('\n').filter(l => l.trim())
      if (lines.length > 0) {
        const parsed = lines.map(line => parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex))
        const classified = parsed.map(t => ({
          ...t,
          category: classifyDescription(t.description, allRules)
        }))
        setTransactions(classified)
      }
    }
    // Don't clear transactions when csvContent is empty - let user keep their data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvContent, delimiter, dateIndex, descriptionIndex, amountIndex])

  const handleUpdateExcluded = (id: string, excluded: boolean) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, excluded } : t))
  }

  const handleCategoryChange = (id: string, category: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, category, overridden: true } : t))
  }

  const handleDateChange = (id: string, date: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, date, overridden: true } : t))
  }

  const handleOverrideModeChange = (id: string, overrideMode: boolean) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, overrideMode } : t))
  }

  const handleAddRule = (keyword: string, category: string) => {
    setCustomRules(prev => ({ ...prev, [keyword]: category }))
  }

  const handleRemoveRule = (keyword: string) => {
    setCustomRules(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [keyword]: _, ...rest } = prev
      return rest
    })
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Expense Analyzer</h1>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-danger" onClick={handleClear}>
              Clear & Start Over
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-btn" onClick={() => { setView('csv') }}>
            CSV Input & Preview
          </button>
          <button 
            className="sidebar-btn"
            onClick={() => { setView('categories') }}
            disabled={!csvAccepted}
          >
            Custom Categories
          </button>
          <button 
            className="sidebar-btn"
            onClick={() => { setView('transactions') }}
            disabled={!csvAccepted}
          >
            Transactions Table
          </button>
          <button
            className="sidebar-btn"
            onClick={() => { setView('summary') }}
            disabled={!csvAccepted || summaries === null || summaries.length === 0}
          >
            Data by Period
          </button>
          <button
            className="sidebar-btn"
            onClick={() => { setView('chart') }}
            disabled={!csvAccepted || summaries === null || summaries.length === 0}
          >
            Cumulative Bar Chart
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {view === 'csv' && (
          <CSVInputPreview
            csvContent={csvContent}
            delimiter={delimiter}
            dateIndex={dateIndex}
            descriptionIndex={descriptionIndex}
            amountIndex={amountIndex}
            onCsvChange={setCsvContent}
            onDelimiterChange={setDelimiter}
            onDateIndexChange={setDateIndex}
            onDescriptionIndexChange={setDescriptionIndex}
            onAmountIndexChange={setAmountIndex}
            onFillExample={handleFillExample}
            onCsvAccept={handleCsvAccept}
            csvAccepted={csvAccepted}
            rules={allRules}
          />
        )}

        {view === 'categories' && (
          <Categories
            rules={allRules}
            baseRules={RULES}
            customRules={customRules}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
          />
        )}

        {view === 'transactions' && (
          <TransactionsTable
            transactions={transactions}
            categories={categories}
            onlyShowOthers={onlyShowOthers}
            onOnlyShowOthersChange={setOnlyShowOthers}
            onExcludedChange={handleUpdateExcluded}
            onCategoryChange={handleCategoryChange}
            onDateChange={handleDateChange}
            onOverrideModeChange={handleOverrideModeChange}
          />
        )}

        {view === 'summary' && summaries && selectedMonth && (
          <DataByPeriod
            summaries={summaries}
            selectedMonth={selectedMonth}
            onSelectionChange={(type, year, month) => {
              if (type === 'month' && year && month) {
                setSelectedMonth({ year, month })
              }
            }}
            onBack={() => {}}
            onNext={() => {}}
          />
        )}

        {view === 'chart' && summaries && (
          <CumulativeBarChart
            summaries={summaries}
            onBack={() => {}}
          />
        )}
      </div>
    </div>
  )
}

export { App }

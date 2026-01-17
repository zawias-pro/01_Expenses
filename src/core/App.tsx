import { useEffect } from 'react'
import './App.css'
import { parseCSVLine } from '../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../parsing/classifyDescription/classifyDescription.ts'
import { parsePolishAmount } from '../parsing/parsePolishAmount/parsePolishAmount.ts'
import { hashTransaction } from '../parsing/hashTransaction/hashTransaction.ts'
import { CSVInputPreview } from '../views/input/CSVInputPreview.tsx'
import { TransactionsTable } from '../views/table/TransactionsTable.tsx'
import { DataByPeriod } from '../views/data-by-period/DataByPeriod.tsx'
import { CumulativeBarChart } from '../views/data-cumulative/CumulativeBarChart.tsx'
import { Categories } from '../views/categories/Categories.tsx'
import { Budget } from '../views/budget/Budget.tsx'
import {
  useStore,
  useAllRules,
  useCategories,
  useSummaries,
  exportState,
  importState,
} from '../store/useStore.ts'

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

const App = () => {
  // Store state
  const view = useStore((state) => state.view)
  const csvContent = useStore((state) => state.csvContent)
  const delimiter = useStore((state) => state.delimiter)
  const dateIndex = useStore((state) => state.dateIndex)
  const descriptionIndex = useStore((state) => state.descriptionIndex)
  const amountIndex = useStore((state) => state.amountIndex)
  const transactions = useStore((state) => state.transactions)
  const selectedMonth = useStore((state) => state.selectedMonth)
  const customRules = useStore((state) => state.customRules)
  const searchQuery = useStore((state) => state.searchQuery)
  const selectedCategory = useStore((state) => state.selectedCategory)
  const selectedMonthFilter = useStore((state) => state.selectedMonthFilter)
  const amountFilterType = useStore((state) => state.amountFilterType)
  const amountFilterValue = useStore((state) => state.amountFilterValue)
  const sortColumn = useStore((state) => state.sortColumn)
  const sortDirection = useStore((state) => state.sortDirection)
  
  // Store actions
  const setView = useStore((state) => state.setView)
  const setCsvContent = useStore((state) => state.setCsvContent)
  const setDelimiter = useStore((state) => state.setDelimiter)
  const setDateIndex = useStore((state) => state.setDateIndex)
  const setDescriptionIndex = useStore((state) => state.setDescriptionIndex)
  const setAmountIndex = useStore((state) => state.setAmountIndex)
  const setTransactions = useStore((state) => state.setTransactions)
  const setSelectedMonth = useStore((state) => state.setSelectedMonth)
  const updateTransactionExcluded = useStore((state) => state.updateTransactionExcluded)
  const updateTransactionCategory = useStore((state) => state.updateTransactionCategory)
  const updateTransactionDate = useStore((state) => state.updateTransactionDate)
  const updateTransactionComment = useStore((state) => state.updateTransactionComment)
  const resetTransactionDate = useStore((state) => state.resetTransactionDate)
  const resetTransactionCategory = useStore((state) => state.resetTransactionCategory)
  const removeTransaction = useStore((state) => state.removeTransaction)
  const setSearchQuery = useStore((state) => state.setSearchQuery)
  const setSelectedCategory = useStore((state) => state.setSelectedCategory)
  const setSelectedMonthFilter = useStore((state) => state.setSelectedMonthFilter)
  const setAmountFilter = useStore((state) => state.setAmountFilter)
  const setSortColumn = useStore((state) => state.setSortColumn)
  const setSortDirection = useStore((state) => state.setSortDirection)
  const updateCategory = useStore((state) => state.updateCategory)
  const removeCategory = useStore((state) => state.removeCategory)
  const clearAll = useStore((state) => state.clearAll)
  
  // Computed values
  const allRules = useAllRules()
  const categories = useCategories()
  const summaries = useSummaries()
  
  // Validate selectedMonth when summaries change
  useEffect(() => {
    if (summaries && summaries.length > 0) {
      const firstSummary = summaries[0]
      if (!firstSummary) return
      
      if (selectedMonth === null) {
        // Set to first available month if not set
        setSelectedMonth({ year: firstSummary.year, month: firstSummary.month })
      } else {
        // Validate that the selected month exists in the summaries
        const monthExists = summaries.some(
          (s) => s.year === selectedMonth.year && s.month === selectedMonth.month
        )
        if (!monthExists) {
          // If selected month doesn't exist, set to first available
          setSelectedMonth({ year: firstSummary.year, month: firstSummary.month })
        }
      }
    } else if (summaries === null || summaries.length === 0) {
      setSelectedMonth(null)
    }
  }, [summaries, selectedMonth, setSelectedMonth])

  const handleSave = () => {
    // Zustand persist middleware handles saving automatically
    // This button can remain for user feedback, but persistence is automatic
  }

  const handleClear = () => {
    clearAll()
  }

  const handleCsvAccept = () => {
    if (!csvContent.trim()) return
    
    const lines = csvContent.split('\n').filter((l) => l.trim())
    if (lines.length === 0) return
    
    // Parse all lines and track which line index they came from
    const parsedWithIndex = lines.map((line, index) => ({
      transaction: parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex),
      originalLine: line,
      lineIndex: index
    }))
    
    // Filter out invalid transactions first
    const validWithIndex = parsedWithIndex.filter(item => item.transaction.isValid)
    const invalidCount = parsedWithIndex.length - validWithIndex.length
    
    // Only process valid transactions
    const classified = validWithIndex.map((item) => {
      const t = item.transaction
      const category = classifyDescription(t.description, allRules)
      // Automatically exclude income transactions (positive amounts)
      // but keep them valid so the checkbox can be unchecked later
      let excluded = false
      try {
        const amount = parsePolishAmount(t.amount)
        if (amount > 0) {
          // This is an income transaction, exclude it by default
          excluded = true
        }
      } catch {
        // If parsing fails, don't exclude (shouldn't happen for valid transactions)
      }
      return {
        transaction: {
          ...t,
          category,
          excluded,
          addedAt: new Date().toISOString(), // Set timestamp when transaction is added
        },
        originalLine: item.originalLine,
        lineIndex: item.lineIndex
      }
    })
    
    // If no valid transactions, don't proceed
    if (classified.length === 0) {
      return
    }
    
    // Check for duplicates by hash
    // Generate hashes for existing transactions that don't have them (in-memory only)
    const existingHashes = new Set(transactions.map(t => {
      if (!t.hash) {
        // Generate hash on the fly for existing transactions without hash
        return hashTransaction(t.date, t.description, t.amount)
      }
      return t.hash
    }))
    const duplicates: typeof classified = []
    const unique: typeof classified = []
    
    classified.forEach(item => {
      if (existingHashes.has(item.transaction.hash)) {
        duplicates.push(item)
      } else {
        unique.push(item)
        existingHashes.add(item.transaction.hash)
      }
    })
    
    // Show alert if invalid transactions or duplicates were found
    const messages: string[] = []
    if (invalidCount > 0) {
      messages.push(`Found ${String(invalidCount)} invalid transaction(s) that were not added.`)
    }
    if (duplicates.length > 0) {
      messages.push(`Found ${String(duplicates.length)} duplicate transaction(s) that were not added.`)
    }
    if (messages.length > 0) {
      const uniqueCount = unique.length
      if (uniqueCount > 0) {
        messages.push(`Added: ${String(uniqueCount)} valid transaction(s)`)
      } else {
        messages.push(`No transactions were added. Please fix errors in the CSV preview.`)
      }
      window.alert(messages.join('\n\n'))
    }
    
    // Only append unique transactions
    if (unique.length > 0) {
      setTransactions([...transactions, ...unique.map(item => item.transaction)])
    }
    
    // Remove only successfully added lines (valid and unique) from textarea
    // Keep invalid and duplicate lines
    const linesToRemove = new Set(unique.map(item => item.lineIndex))
    const remainingLines = lines.filter((_, index) => !linesToRemove.has(index))
    
    // Update textarea with remaining lines
    setCsvContent(remainingLines.join('\n'))
  }

  const handleFillExample = () => {
    setCsvContent(INITIAL_CSV)
  }

  const handleExport = () => {
    const jsonString = exportState()
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = `expense-analyzer-state-${dateStr ?? ''}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const jsonString = event.target?.result as string
        if (jsonString) {
          const success = importState(jsonString)
          if (success) {
            alert('State imported successfully!')
          } else {
            alert('Failed to import state. Please check the file format.')
          }
        }
      }
      reader.readAsText(file)
    }
    input.click()
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
            <button className="btn btn-secondary" onClick={handleExport}>
              Export State
            </button>
            <button className="btn btn-secondary" onClick={handleImport}>
              Import State
            </button>
            <button className="btn btn-danger" onClick={handleClear}>
              Clear & Start Over
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-btn" onClick={() => { setView('csv') }}>
            CSV Input
          </button>
          <button 
            className="sidebar-btn"
            onClick={() => { setView('categories') }}
          >
            Categories
          </button>
          <button 
            className="sidebar-btn"
            onClick={() => { setView('transactions') }}
          >
            Transactions Table
          </button>
          <button
            className="sidebar-btn"
            onClick={() => { setView('summary') }}
          >
            Data by Period
          </button>
          <button
            className="sidebar-btn"
            onClick={() => { setView('chart') }}
          >
            Cumulative Bar Chart
          </button>
          <button
            className="sidebar-btn"
            onClick={() => { setView('budget') }}
          >
            Budget
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
            rules={allRules}
          />
        )}

        {view === 'categories' && (
          <Categories
            rules={allRules}
            customRules={customRules}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
          />
        )}

        {view === 'transactions' && (
          <TransactionsTable
            transactions={transactions}
            categories={categories}
            onExcludedChange={updateTransactionExcluded}
            onCategoryChange={updateTransactionCategory}
            onDateChange={updateTransactionDate}
            onCommentChange={updateTransactionComment}
            onResetTransactionDate={resetTransactionDate}
            onResetTransactionCategory={resetTransactionCategory}
            onRemoveTransaction={removeTransaction}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectedCategoryChange={setSelectedCategory}
            selectedMonthFilter={selectedMonthFilter}
            onSelectedMonthFilterChange={setSelectedMonthFilter}
            amountFilterType={amountFilterType}
            amountFilterValue={amountFilterValue}
            onAmountFilterChange={setAmountFilter}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortChange={(column, direction) => {
              setSortColumn(column)
              setSortDirection(direction)
            }}
            onUpdateCategory={updateCategory}
          />
        )}

        {view === 'summary' && summaries && selectedMonth && (
          <DataByPeriod
            summaries={summaries}
            selectedMonth={selectedMonth}
            transactions={transactions}
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

        {view === 'budget' && (
          <Budget />
        )}
      </div>
    </div>
  )
}

export { App }

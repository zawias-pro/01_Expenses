import { useState, useEffect } from 'react'
import './App.css'
import { parseCSVLine, processTransactions, parseRules } from '../parsing/calculations.ts'
import type { Transaction, MonthlySummary } from '../parsing/calculations.ts'
import { Step1 } from './Step1.tsx'
import { Step2 } from './Step2.tsx'
import { Step3 } from './Step3.tsx'
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

const STORAGE_KEYS = {
  csv: 'expense-analyzer-csv',
  transactions: 'expense-analyzer-transactions',
  step: 'expense-analyzer-step',
}

type Step = 1 | 2 | 3

function App() {
  const [step, setStep] = useState<Step>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.step)
    return saved ? (Number(saved) as Step) : 1
  })
  const [csvContent, setCsvContent] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.csv)
    return saved || INITIAL_CSV
  })
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.transactions)
    return saved ? JSON.parse(saved) : []
  })
  const [summaries, setSummaries] = useState<MonthlySummary[] | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.csv, csvContent)
  }, [csvContent])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.step, String(step))
  }, [step])

  // Recalculate summaries on initial load if we're on step 3
  useEffect(() => {
    if (step === 3 && transactions.length > 0 && summaries === null) {
      const activeTransactions = transactions.filter(t => !t.excluded)
      const result = processTransactions(activeTransactions, RULES)
      setSummaries(result)
      // Set selected month to the first available month
      if (result.length > 0 && selectedMonth === null) {
        setSelectedMonth({ year: result[0].year, month: result[0].month })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.csv)
    localStorage.removeItem(STORAGE_KEYS.transactions)
    localStorage.removeItem(STORAGE_KEYS.step)
    setCsvContent(INITIAL_CSV)
    setTransactions([])
    setSummaries(null)
    setStep(1)
  }

  const handleCsvSubmit = () => {
    const lines = csvContent.split('\n').filter(l => l.trim())
    const parsed = lines.map(parseCSVLine).filter((t): t is Transaction => t !== null)
    setTransactions(parsed)
    setStep(2)
  }

  const handleUpdateExcluded = (id: string, excluded: boolean) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, excluded } : t))
  }

  const handleProcess = () => {
    const activeTransactions = transactions.filter(t => !t.excluded)
    const result = processTransactions(activeTransactions, RULES)
    setSummaries(result)
    // Set selected month to the first available month
    if (result.length > 0) {
      setSelectedMonth({ year: result[0].year, month: result[0].month })
    }
    setStep(3)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Expense Analyzer</h1>
        <button onClick={handleClear}>Clear & Start Over</button>
      </div>
      
      {step === 1 && (
        <Step1
          csvContent={csvContent}
          onCsvChange={setCsvContent}
          onNext={handleCsvSubmit}
        />
      )}

      {step === 2 && (
        <Step2
          transactions={transactions}
          onExcludedChange={handleUpdateExcluded}
          onBack={handleBack}
          onNext={handleProcess}
        />
      )}

      {step === 3 && summaries && selectedMonth && (
        <Step3
          summaries={summaries}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

export { App }

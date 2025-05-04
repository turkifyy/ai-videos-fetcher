const admin = require('firebase-admin');
const axios = require('axios');

// YouTube API Keys Rotation
const YOUTUBE_API_KEYS = [
  'AIzaSyAre88KKhL_izC0nJjbWSakvmIOPSleGhs',
  'AIzaSyCk4XNcGoqSSAZMCNmar6B2bFUMfN0lxok',
  'AIzaSyAKuYPfahrDzfAZFv5WOOv1FRIle8aSwiQ',
  'AIzaSyARtyC6riNolI0cayoId61SUNSO-VuUSoU',
  'AIzaSyAU7UQiJ__3hojf28zdYDZpDtDwyLxhJGo'
];
let currentKeyIndex = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_KEY = 88;

// YouTube Channels
const CHANNELS = [
'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie
'UCq-Fj5jknLsUf-MWSy4_brA',  // TSeries
'UCbCmjCuTUZos6Inko4u57UQ', // Cocomelon Nursery Rhymes
'UCpEhnqL0y41EpW2TvWAHD7Q', // SET India
'UCbp9MyKCTEww4CxEzc_Tp0Q', //Stokes Twins
'UCJ5v_MCY6GNUBTO8-D3XoAg', // WWE 
'UCyoXW-Dse7fURq30EWl_CUA', // Goldmines
'UCiVs2pnGW5mLIc1jS2nxhjg', // 김프로KIMPRO
'UC6-F5tO8uklgE9Zy8IvbdFw', // Sony SAB
'UCOmHUn--16B90oW2L6FRR3A', //BLACKPINK
'UC5gxP-2QqIh_09djvlm9Xcg', // Alan's Universe
'UCRijo3ddMTht_IHyNSNXpNQ', //Dude Perfect
'UC295-Dw_tDNtZXFeAPAW6Aw', // Minuftte Crafts  
'UC3gNmTGu-TTbFPpfSs5kNkg', // Movieclips 
'UC9CoOnJkIBMdeijd9qYoT_g', // Ariana Grande
'UC0C-w0YjGpqDXGB8IHb662A', // Ed Sheeran 
'UCIwFjwMjI0y7PDBVEO9-bkQ', // Justin Bieber
'UCEdvpU2pFRCVqU6yIPyTpMQ', // Marshmello
'UCfM3zsQsOnfWNUppiycmBuw', // EminemMusic
'UC2tsySbe9TNrI-xh2lximHA', // A4
'UCWrmbQy_KxoBTAHCU7HiErg', // ARGEN
'UCZFBnnCCO65xMXOdtFz8CfA', // Sofi Manassyan 
'UCf07_zJEZAfr8vPof-2cjTQ', // FlashPass
'UCUcfej7lPDoeqTlferD2mcw', // Czn Burak
'UC2J3OlDA_lvVylS4nWy26fw', // NOTSR7
'UCHCbPLCd3nEAlNl2C55rsJg', // Date With Gym
'UC2-MyyXdijbIFiUYQlMit8w', // bonnii
'UCbH8ThM1Mkr19tl4tDOTDDQ', // BroxEditZ
'UCKGyZt16D8aztPPqMwwemxA', // Cars911
'UCiV4OPgaUfwX3HvktO9YPtA', // Foodie Mama 
'UCFBPLzH1iphF9fy-52DYzAg', // Chocodogger
'UCDeH8IeKqvzn8x_iZPAuIfA', // mreviatar
'UCcAoZZkCKvoqSJmVbRaSsDg', // Роман Magic
'UCSbKI3s_8tg3KeQ4R4_6c6g', // Linguini
'UCvoNmw8SGGBVMtSgiQSZK2Q', // mister bombastic
'UC9u3v8d3eSKHLgre8PgUV6A', // BuzzGo
'UCX6r4rkU7Js0HTWDPLTl1dg', // Respect 100M
'UCxnOf_DD412wLKhjgqTt9Mw', // Valerie Lungu
'UCjJ07jOCA8TsqOCtD2324WQ', // Txmshorts
'UC6NJVNuibWilqOTeNCWZVIg', // Hoanftbl
'UCeP5A8YIEQ61tFiav8vzJDg', // narchooo
'UCYRrP22txtZdPr7t2IxkR9w', // Ironaldox
'UC1a2ZCw7tugRZYRMnecNj3A', // Celine Dept
'UCWsDFcIhY2DBi3GB5uykGXA', // IShowSpeed
'UCLiTe0aOHShx7hXGyqZ9UIw', // Nat Geo Abu Dhabi
'UCPrTN8ANZigvYAshg9r3r2A', // JATMIKO HADI NEGORO
'UCkTsgrwFzlArIMAV2IuwGrw', // Knizr
'UC1vg77s-ci5Dsqcik83yphQ', // c7epic
'UC14UlmYlSNiQCBe9Eookf_A', // FC Barcelona
'UC78zEsPqqt933phfYcvPZ_A', // JETCAR
'UC5y5eBpVuIaRp5x6NJUEUdQ', // MonDejour
'UCVVD1fGNHFnFWKYSFnWrsWg', // Snap Maromba
'UCm5gUTCoXo_M_I8yWaPboug', // ItzUv
'UCG5qGWdu8nIRZqJ_GgDwQ', // Premier League
'UCyGa1YEx9ST66rYrJTGIKOw', // UEFA
'UCG2RHsq6QejkzIluPfyZ8dg', // Miyinnia
'UCo9RMALE8ELFhnHnDg7eA_w', // BO BROWN
'UC5Y1pPVNm-odhiubuRO1D6A', // Jeremy Lynch
'UCKgDT4CiNEKlW3O2GKpFi_A', //  Rens
'UC6QZ_ss3i_8qLV_RczPZBkw', // ISSEI
'UCOicc9kd58k_XR3D7bTx8oA', // Rico Animations
'UCDCLw9qHo5A6HrIcuOvA6Hw', // BRANDOMEMES 
'UCy9qkaWFOGHHzk-QjPMQxyw', // JRMemes 
'UCNQAoLEv87L7NgUp4We3HIg', // CRAZY GREAPA 
'UCuZBxbwknYtE30Qdh0dQ1Tg', // Jacksinfo 
'UC_485Ao_SxlCaBlOZORVsVQ', // Zdak
'UC7zQcu8FeM_RmUJmwJmCh7w', // UrBoyTrev206
'UCNlDLIic5wnXmScZYjXBrjg', // Catalyst
'UCBaJVMx5fcWOHsmPH3IxKKQ', // Wubzzy
'UCYGElWL8dYqreUh9wNb3s2A', // Vines Best Laugh 
'UC2bxGXFgyCS73exzJ_i0zww', // 	Nba Rich
'UCbv_WFkthQxrqRVwLAcRT_Q', // Phenomenon EditZ
'UCfF7GECIz-rj74KMh9S4ilg', // MiAnimation
'UCUnmH8N8k4E7y3dKfCzDKKg', // Brandon B
'UCoJ5osZ535ar2kzHwQMnLsA', // Double Date 
'UCefnOSmxkOzKR3aUdxgVnsQ', // Marulho
'UCQOidFKQBMvLXk7PxGBXWyA', // The Gabriels
'UCYCh5_-In6wtzWR-s_kM03w', // HT Official
'UCym7PDoe2kcT_Z30LQyGy1w', // SIXPATHSSS
'UCq45uL90wzglh4JTSn34YZQ', // MoniLinaFamily
'UCvLHvyLxBwHKAEx5u09vqVw', // Jehiely N Alex
'UCymK_3BWUcoYVVf5D_GmACQ', // Tsuriki Show
'UCjdrGjv4bGt5HvApBe1HADQ', // ElegantBeautybyBritt
'UCcQ18ScARDXR0hf-OMQofsw', // ox_zung 
'UCSYuOoOUKFA3eZ0L8sRXSTQ', //wish SA 
'UCJadYQZAbzhNweKK621hVQg', // Sósia do Vini Jr
'UCYXrKtLb_uC8vlvalVgef3Q', // Shon Edit
'UCgDBOyrroHE07kPmeA-Ukyw', // Anne P
'UCSn-PqF7wU5gXJRpck4ZQIA', // Peter Nguyen
'UCiLjzcRKUqk0IMxhzyyYFyQ', // Wars JR
'UCpCLsVt-9LhvDKvEzE7Kw7A', // Bridon Production LLC Seany Tv
'UCtH7B4OprU9bUYA0xknelng', // LiveRankings
'UCCfKlFlKYBxZ-UU2dWc17IQ', // boxtoxtv
'UCuj-Tt5acrmGbujvRxVv9Fg', // DOVE CLUBB
'UC77xNOzWNYsS8dP2HSkjEEw', //FARUKKHANCR7
'UCQR0MYr5hvRlWIkrRNZ_mLg', // Laugh Hub
'UCYwi1YamkmM9zsm_k27iC_Q', // Tokyo_boy 
'UCtjYtFpwvLoy9gt1GDK2klg', // Kristen Hanby
'UCEr55381WIqO1w_IzgcI5DQ', // Anwar Jibawi
'UCV4uuw1QDPhoiyweotfA5rw', // AdamW
'UC82rNcKjcMnllk_P2cxheJw', // Bebahan
'UCb9A6uotqUiuVCvVp4GMqOg', // Justin Flom
'UCwmGHKwW6AE_NBQ3CNcO9-A', // Oscar's Funny World
'UCD5Bq1i3pZPKIw4bJ856yZg', // Alex & Annet
'UC24QmKMD73AwOYyCciq3pjA', // Respect
'UCdgHLEnxO50MI4yB6MYSlbQ', // Shock Cat Reaction
'UCfsmz7-5_Gw2UlPmCn1LMjQ', // Enjoy Wrestling 
'UCgrdZm9Nx3rCj8WenIoSIqw', // Nicocapone
'UCW33L17SyCw3-W4uFBLMjgQ', // Mahdi Fun
'UCq5hJ7CjhJLRWlcykcZqq1A', // benbu
'UCBGbTTcgn8AVEsEWdT3tI3Q', // IGP
'UCQBzn-XGeA4sq9kB8Gl8iHg', // Victoria Pfeifer
'UCBdDCfMX_NaRYLejRJHZZ1A', // LewisBlogsGaming
'UCFrpmAojFL9HlgBPU5p6Nog', // ItzSurajBro
'UCMh3v4KOrtoDKziO9d2qAHg', // Agirlandadoodle 
'UCdX5KXiCTPYWYZscfphgQ4g', // BeatboxJCOP 
'UCc0ulU8V23Fp-s9MGdo4pfg', // Mega Foodie
'UC4sQeLmtseXrdWUNI8LHINg', // ossol
'UC_apha4piyJCHSuYZbSi8uA', // Joga Bonito BR
'UCH8x9zAJbpfipmHosNuwu_A', // Endless Love 
'UCUvYDuZ2dwhYib7k7WneIRA', // Aexon1
'UC2HJGHpNnoWvLBey9xNrEPg', // Andrew wave 
'UCRS2sBiQZjLO6NJaYwHKeYg', // Fuzzie queen beatzz 
'UCl3F2QfnlJj3BCYhbbG4wqg', // RESPECT 1M
'UCq9TsFbtNkfRiKa7YxKEorw', // FaizaEditz
'UCe9qomDawkYpuPyG6prIfCg', // ZAMAN
'UCp41n_WUDdvC2qu20MsmYng', // isaacsamz
'UC5NEWyJDtr8vtzJWT6SXK4Q', // Eternal Love
'UCZTGFkS7f-6NqCw66-Rj2Ag', // Drama Subho
'UC45w2hxRWSdVPUHZXNl_CuQ', // ahmed elghnam
'UCa4BGN_3s2xW3rci_v6Nphw', // BTS ARMY
'UCJhlFKSRaF483kPayLjovyA', // C11kp
'UC-MeFI2sQpSoi0zxavR5dLw', // Viral Vision HD
'UC3TbW4h-rMVsc5gwzADOpVA', // Baht Oyunu 
'UCW4SUzKbIILKr5-i8sZ0RzQ', // Sergen edits
'UCKgmeYxDvB6PefyUeogjA0g', // YourLuvRide
'UCW3oNukqHeD67ET4DSzJN7A', // FADY Fily
'UC8lnmTA5u9sfqbHtDeNClAQ', // Hello Origami
'UCyahIZNtNmqK1LeNF0KlFZw', // Yalı Çapkını
'UC8yB1y8aHYXi72epl01GaDw', // MaxianFootball
'UCq0ybF3esnwdrGXsLCd0f8w', // Lior Explainer
'UC7ncFNU-4Pjn350beuM-gCg', // Suliman
'UCs9JaFV3d2LVtRR9zMtdhNQ', // The Move Sky
'UC75E7hN2RwBqxGgArBKgiKA', // اوسكار العراق 
'UCoS14Se14uOJPArUbQPLhFQ', // EditDE7
'UCRnXj2LxvDBv8ErtFvTKTRA', // Rendi goodboy
'UCnNmn4vRSbuZ_X2vjjtDOMQ', // Qcriple
'UCZR2b4occmB3Qtlkjee8ytg', // MijEditz
'UClaiPI7ouBRPhkarxO7DV9w', // Oleg Pars
'UCcqIANwDbdjHQWlN3tl1T2A', // ZYCBBM 
'UCsY4tPKd0mcHScevYyP1w2A', // SciMythical007 
'UC3xgevNpGmAgWpdjtTXR20w', // Wian 
'UCerlWKdEoZ9wOQf2WUWi9Rg', // X2 
'UCVo-g8QCIKdXmX7rcT_aiVw', // Saurov Official
'UCac6m8K3OGHUT4itHwpCAmw', //  Lost in Time
'UCTjnJL1MXV7Q4YVA3t7pFVg', // Wissada
'UCdMNbinLblfrN-Hm_HzXUiQ', // جيون Mina 
'UCkLNHZZsC3LKdUAroKNwOOw', // CuRe
'UCFBYRGJpJ2FG7Oh-JpCOZkQ', // Puppies Love 
'UCxDrxkFEcYviLEJ2C5u_kbQ', // JasminandJames
'UCIi133AJfzVdiAJe80MLbDQ', // Asel Mustafa
'UClFSUSP4WjDHnEqxNf4C43Q', // Tropical insectsa
'UCsx78_SK9xUzNcjJpLTbTzw', // movlogs
'UC96nWfYyNUfvUklBJtIplRA', // محبين لانا ولين
'UCzpucOwW8PQXQ_VU34H7kuA', // Narins Beauty Family
'UCqq5n-Oe-r1EEHI3yvhVJcA', // AboFlah
'UCQB9yZWLvcSNI9ruw74iF8Q', // Ahmad Aburob
'UCPokJ1HtDczTd0rRPMwMeWw', // Omar aburobb
'UCjqme9B0yXqIC1PZkFFUBfw', // MarceloComCelo
'UC497tVZykgrFrJvDXdI_-SA', // Jin and Hattie
'UCwHE1kM1CPJd_pI9FQ0-4dg', // shfa
'UCAHfrKOebWz6_23eKKm9vqw', // Misaha
'UCV2JkEBmtfSYGAIlprAhAyQ', // Arab Games Network 
'UCrw49J13uH1oElsUC3q_1pw', // N
'UC-v_CmOijyT8QVWq9H_1qfg', // AuraForge
'UCZE_XnY_UazcRILVru7znDw', // Khalid Al Ameri
'UChOPyo-uWLVi5uO53mSBX-w', // Noor Stars 
'UCwBGFE-r7YeFFHT7JmxWPgg', // Ossy Marwah 
'UCWKF7jRIPLVBcnE2p993yAg', // Bessan Ismail
'UCdcZhYtGKo8n1VRLgxMe_hA', // Kika Kim
'UCYJHVw7OYgtwiNks92eag5Q', // simba17 official
'UCFGZTrhn2GbEsgQ8-12-rIA', // Ghaith Marwan
'UCoWHUkZf4bATsTlnqcNVPfw', // Bjlife
'UCxEGVXh6fi-XYo58NZrbIHQ', // BanderitaX
'UC9Z-zmiY4J3KGe_aNPATSeA', // Basma if
'UCXnKd1R2a7ebk6hvIzS57WA', // Osama
'UCVEvXfblll0OjxBE_I9YeOw',  // Karadenizli Maceracı
'UCTO40euu-crofOMmL3SULqg', // CHICKEN BALALM
'UC0fvGpDXi7sV2hbgD-O47yw', // Amaury Guichon
'UC7Vr_TnuV66BKKHQ5qOsUKA', // Yasser Ahmed
'UCXxjVrHdBLJV0EhOczWTw0g', // Low Budget Ball
'UC7108gLyg2hCacGQtH3UqZQ', // Stillworse
'UCm_K3dRBOVt3rHLtPsjVSjA', // Marc Ruiz
'UCrw49J13uH1oElsUC3q_1pw', // N
'UChHje2tB0q8m-kCaNdJVDmA', // Hdit W Kora
'UCkwICkGluKZ8ZJVVQFQ-pdQ', // abdel abdou
'UCjDeNOJxVmNTlP2AfAfPzbw', // 	Ali ball
'UCvQ0oz1NhZZU7-LC8z7KGuA', // Dm football
'UC2bW_AY9BlbYLGJSXAbjS4Q', // Live Speedy
'UCU8bQExxd38i-mnn-GLOtfA', // UFC Eurasia
'UCGmnsW623G1r-Chmo5RB4Yw', // JJ Olatunji
'UCmf_VrB73I-eJ3fq0adaOkg', // mkbHD
'UCMiJRAwDNSNzuYeN2uWa0pA', // Mrwhosetheboss
'UCdqs-ItofPRWvLm3mM1dNlg', // TechDroider
'UCtxD0x6AuNNqdXO9Wp5GHew', // URCristiano
'UC5CA3F_2LalVkbYpJq3MGhw', // Naifh Alehydeb
'UCvPW1W4WlpTgNezZzwIstLA', // Nogla
'UC0Wju2yvRlfwqraLlz5152Q', // PANDA BOI
'UCcveFkjpctOZwCsfp5hVLyg', // ZachChoi
'UCmoMmj6q312Grl9zN-0z65g', // candy
'UCjdrGjv4bGt5HvApBe1HADQ', // EBB Super Star
'UCdN6LdWhEyiA2u7LPonxz9Q', // Real Aryan khan
'UCaFUrR3oSxOl5Y9y6tvLTEg', // WillNE
'UC0DRTkIeQW27Lk4h1tkc6ew', // Elias Dosunmu
'UCksiqtuWYtN2YluvAQnV2dQ', // Doechii
'UCuHvKRvLtJk7Rz1Ga4vk_oQ', // Chris Colditz
'UCECU4vZ2a0Tuu8s6IkPvmlw', // ItsSharkBait
'UCKKXBbKDDk7b4VhD6SKmTUw', // SKY
'UCnUnQLGIBnyFkyK-RHoolYw', // CursorGemink
'UCjp_3PEaOau_nT_3vnqKIvg', // Junya
'UCQ7Lgy-cBH0tJyEiRKNBJbQ', // katebrush
'UCWheC07UYzRWXsv9yUnZJFw', // FUNNY
'UCHA7nav_7GnACDpLca3CoEA', // Movie Digger
'UCj2LHSBZJOMT0a9QVPCfhmQ', // alifsedits
'UCfR_qz9WBrAuwWg57hDilSw', // MEZOooo
'UCKuHFYu3smtrl2AwwMOXOlg', // Will Smith
'UC9hJ5XcjHXYjwDOqrlQUuow', // Saad Lamjarred
'UCJCj2HtcnbOyCj1rmKaxwJg', // Mohamed Ramadan
'UCxcwb1pqg2BtlR1AWSEX-MA', // MovieLuxeShorts
'UCDwzLWgGft47xQ30u-vjsrg', // Nikocado Avocado
'UCo-roQuba3lhinCfHCPH5xg', // realmadrid
'UCgAGG57rMYXOVX1tGzEbS3Q', // Reel Rush Retro
'UCiBsG3WPwViGjD0_UMNPyyA', // PaulHughes8995
'UC06hDL3xAoW5PAWFbRsA3XQ', // Jake Ceja
'UCpOCUPuhb-7-1nJTAkFdQmg', // Cross
'UCEmiFcbdHjOr-Fap1wtn_Eg', // DarkGhostz
'UCjL2PLD-yCkW1eF2n2mj17A', // Hamza ACH TEMA
'UCgTGNW6muQstaepTdYVPSrA', // CLICK STUDIO
'UCQgJ_-jor303b66orI0NlOw', // XY Being
'UChfdidbjuzN-kctBB-DXdYQ', // Ask Laften lamen 
'UC0BkmSnNP27tXmTPbnlnLew', // Kardeşlerim
'UCEuzpECVAdEpLV2EF_1tLNw', // ALLEditedBy
'UClzlDrCsu8JyDwYYGDh0ing', // Price of Passion
'UCV_UnXMvco4uaqeMMBMWcxA', // Cartoon Network MENA
'UCvK8MMhlYSL7nxkhFvFCZNg', // Mucize Doktor
'UCBbFJIrfEGfXAM4jwKYwytw', // Çukur
'UCa_FYJ0PvHeR6Oplugm_Kmw', //  abody sorie
'UCEGDtSn99maZy025ZrmjClA', // Kara Sevda
'UCghWOHU8RjSkOMm6HaiScMg', // Erkenci Kuş
'UCiLjmA70t_77XFGj9UVOq_Q', // TRT Drama Arabic
'UCQ6SMOd5_Goop14_P5L_Leg', // The Promise Arabic
'UCn3MeethjoqLhv1NV2hs91Q', // Fazilet Hanım ve Kızları
'UC8IlPn7Tq1E5Ktb9Cf_OR3w', // Vanzs001
'UCqV8uC1lHHVdbDdw-si976g', // JRDAnime
'UC9UxdkWXNsRFgM-MF8Brt6g', // Rezero72
'UCtc7rzdsalXrtQGIQra7LtA', // Best Movie Moments and Clips
'UCzu8CMR8o5vF8yMLSZSkXFg', // FlexxFlixx
'UC8plQBFksDc_7Eecu3ezDSA', // irongers edits
'UCjCg64JjmXR2mc8vg1NyClQ', // Sartre Nick
'UCEzw0zwo-L_355bo28jjAkQ', // AK TOP STAR MOVIES
'UCUOMzT3_Ty5mO9Hx9tcXITQ', //GarrasReales
'UC-U6hnCuuhVGHdkCJ--NfgA', // Woof World
'UCGt3d14D3wiqpFTIoqUMw7Q', //  top
'UCgoKH0e1n5II305aJamUnWA', // Abirz Kitchen
'UCdY_pd5-KfcP1_nDL1tpthQ', // Chef le3roubi
'UCIEv3lZ_tNXHzL3ox-_uUGQ', // Gordon Ramsay
'UCDT9Sc8YgtT7Qq8dqe4sgHg', // CHEF OMAR
'UCV4RB6eqmfj358xw3KZmxoA', // Anas Elshayib
'UCOk1u4xi35qArG3kcyMEkFA', // Tefwija Official 
'UCqPDRC1DvTi2VC3WPLlY7qQ', // Azza Zarour
'UCN0quATAyfmTs7mqdtzPq9Q', // Leen AbouShaar
'UCf9wV1445sWowaraXZQa91Q', //HANODY AWESOME
'UC4FOqaFe3XJyWQzT-Kha1aA', // Movie Review
'UCKXrc0_1V2E5OvA-HVeefnA', // AurEdits
'UCp1yc5FhOrIsGPPQnBrN7dg', // DZZ
'UCiRZqLTh6xU1Ew1UIvLt0jw', // Tarek Habib
'UC-4KnPMmZzwAzW7SbVATUZQ', // AJ
'UCPOw2O3_uZ1doro9iR4x6vw', // mmoshaya
'UCilwZiBBfI9X6yiZRzWty8Q', // FaZe Rug
'UC70Dib4MvFfT1tU6MqeyHpQ', // Preston
'UCo6djXsiuTc6fIIzSAT3i9A', // AlwaysPiliPili
'UCbhmcMr9RcC-kZ-SkJ5q5nA', // Teman Suara ASMR
'UCAXEGk-l_ioBMvHa9_uHJjg', // A&B Things
'UCblfuW_4rakIf2h6aqANefA', // Red Bull
'UCNhk8lTJR0wPFoC9kbS0T1Q', // Bay Toon
'UCeSiZk_08JbCGDjdgwqsgEQ', // EGY otaku
'UClR74BSOFXxMOKtuaaPu91Q', // Younes Zarou
'UC86suRFnqiw8zN6LIYxddYQ', // Khaby Lame
'UCCNaMMlI3cOc7yFg52riTqg', // Julius Dein
'UCh-xjYdT-Mha2LBGVsTfOlw', // Sossam
'UCq8DICunczvLuJJq414110A', // Zach King
'UCxUPU7lI249SW_j5WgByJRA', // Mohamad Adnan
'UCyhqIgshhPDSR-nYe8OHWBQ', // cuisine Tima 
'UCNFSZXNim4-cBHU02Hy7R4Q', // Suhaib
'UC95qm5Xg8AOFPQajjriO4CA', // Barhom m3arawi
'UCJdIPJrFvh2KbnbX4U9ILhA', // Otmane El Atmani Reaction
'UCtFXLjeUk7lJ9eN0KAxqn1w', // Yehiaradwan
'UCqe0sSESmaQbLFdTExctQLA', // Marodi TV Sénégal
'UCvC4D8onUfXzvjTOM-dBfEA', // Marvel Entertainment
'UCRE-097LGtx_Zo7LrHvkycA', // JISOO
'UCPNxhDvTcytIdvwXWAm43cA' // Selena Gomez
];

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Main function to fetch videos
async function fetchVideos() {
  try {
    const now = new Date();
    const moroccoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }));
    const currentHour = moroccoTime.getHours();

    const todayStart = new Date(moroccoTime);
    todayStart.setHours(0, 0, 0, 0);
    const videosToday = await db.collection('videos')
      .where('timestamp', '>=', todayStart)
      .count()
      .get();

    if (videosToday.data().count >= 440) {
      console.log('🎯 Daily target (440 videos) already reached');
      return;
    }

    if (currentHour === 19) {
      console.log('⏸️ System resting (7-8PM Morocco time)');
      return;
    }

    for (const channelId of CHANNELS) {
      const currentApiKey = YOUTUBE_API_KEYS[currentKeyIndex];
      let video = await fetchLatestVideo(channelId, currentApiKey);

      if (!video) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        video = await fetchOldestVideo(channelId, currentApiKey, oneYearAgo.toISOString());
      }

      if (video) {
        await db.collection('videos').doc(video.videoId).set({
          ...video,
          isAI: true,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Added video ${video.videoId} from channel ${channelId}`);
        requestCount++;
        if (requestCount >= MAX_REQUESTS_PER_KEY) {
          requestCount = 0;
          currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
          console.log(`🔄 Rotating to YouTube API key ${currentKeyIndex + 1}`);
        }
      } else {
        console.log(`⚠️ No suitable video found for channel ${channelId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
    requestCount = 0;
  }
}

// Fetch latest video
async function fetchLatestVideo(channelId, apiKey) {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}` +
    `&channelId=${channelId}` +
    `&part=snippet,id` +
    `&order=date` +
    `&maxResults=1` +
    `&type=video` +
    `&videoDuration=short`
  );

  if (response.data.items.length === 0) return null;
  return await processVideoData(response.data.items[0].id.videoId, apiKey);
}

// Fetch oldest short video from past year
async function fetchOldestVideo(channelId, apiKey, publishedAfter) {
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${apiKey}` +
    `&channelId=${channelId}` +
    `&part=snippet,id` +
    `&order=date` +
    `&maxResults=10` +
    `&publishedAfter=${publishedAfter}` +
    `&type=video` +
    `&videoDuration=short`
  );

  for (const item of response.data.items) {
    const video = await processVideoData(item.id.videoId, apiKey);
    if (video) return video;
  }

  return null;
}

// Process full video data with likes, comments, avatar, verified badge
async function processVideoData(videoId, apiKey) {
  const detailsResponse = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}` +
    `&id=${videoId}` +
    `&part=snippet,contentDetails,statistics`
  );

  const videoData = detailsResponse.data.items[0];
  if (!videoData) return null;

  const duration = parseDuration(videoData.contentDetails.duration);
  if (duration > 180) return null; // Skip videos longer than 3 minutes

  const channelId = videoData.snippet.channelId;
  const channelInfo = await fetchChannelInfo(channelId, apiKey);

  return {
    videoId,
    title: videoData.snippet.title,
    thumbnail: videoData.snippet.thumbnails.high.url,
    duration: videoData.contentDetails.duration,
    creatorUsername: channelInfo.title,
    creatorAvatar: channelInfo.avatar,
    isVerified: channelInfo.isVerified, // New field for verified badge
    caption: videoData.snippet.title,
    likes: parseInt(videoData.statistics?.likeCount || 0),
    comments: parseInt(videoData.statistics?.commentCount || 0),
    shares: 0
  };
}

// Get channel title, avatar, and verified badge
async function fetchChannelInfo(channelId, apiKey) {
  const res = await axios.get(
    `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}` +
    `&id=${channelId}` +
    `&part=snippet,statistics,status`
  );

  const data = res.data.items[0];
  return {
    title: data.snippet.title,
    avatar: data.snippet.thumbnails.high.url,
    isVerified: data.status?.longUploadsStatus === "eligible" || false
  };
}

// Parse ISO 8601 duration
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return (parseInt(match?.[1] || 0) * 3600) +
         (parseInt(match?.[2] || 0) * 60) +
         (parseInt(match?.[3] || 0));
}

// Run the script
fetchVideos();

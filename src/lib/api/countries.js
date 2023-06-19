const countries = {
    france: {
        competitions: [
            "tennis_atp_french_open",
            "tennis_wta_french_open",
            "soccer_france_ligue_two",
            "soccer_france_ligue_one"
        ],
        name: 'France',
        picture: 'https://flagcdn.com/fr.svg'
    },
    usa: {
        competitions: [
            "soccer_usa_mls",
            "baseball_mlb",
            "americanfootball_xfl",
            "basketball_nba_preseason",
            "baseball_ncaa",
            "icehockey_nhl",
            "basketball_nba",
            "americanfootball_nfl",
            "americanfootball_ncaaf",
            "americanfootball_cfl",
            "icehockey_nhl_championship_winner",
            "golf_us_open_winner",
            "golf_pga_championship_winner",
            "tennis_atp_us_open",
            "basketball_nba_championship_winner",
            "golf_masters_tournament_winner",
            "americanfootball_nfl_preseason",
            "americanfootball_nfl_super_bowl_winner",
            "baseball_mlb_world_series_winner",
            "basketball_wnba",
            "basketball_ncaab",
            "tennis_wta_us_open",
            "baseball_mlb_preseason"
        ],
        name: 'USA',
        picture: 'https://flagcdn.com/us.svg'
    },
    chile: {
        competitions: [
            "soccer_chile_campeonato"
        ],
        name: 'Chile',
        picture: 'https://flagcdn.com/cl.svg'
    },
    australia: {
        competitions: [
            "tennis_wta_aus_open_singles",
            "soccer_australia_aleague",
            "tennis_atp_aus_open_singles"
        ],
        name: 'Australia',
        picture: 'https://flagcdn.com/au.svg'
    },
    brazil: {
        competitions: [
            "soccer_brazil_serie_b",
        "soccer_brazil_campeonato"
        ],
        name: 'Brazil',
        picture: 'https://flagcdn.com/br.svg'
    },
    world: {
        competitions: [
            "soccer_fifa_world_cup_winner",
            "boxing_boxing",
            "soccer_fifa_world_cup",
            "soccer_fifa_world_cup_womens"
        ],
        name: 'World',
        picture: 'https://flagcdn.com/un.svg'
    },
    europe: {
        competitions: [
            "basketball_euroleague",
            "soccer_uefa_nations_league",
            "soccer_uefa_champs_league",
            "soccer_uefa_europa_conference_league",
            "soccer_uefa_europa_league"
        ],
        name: 'Europe',
        picture: 'https://flagcdn.com/eu.svg'
    },
    argentina: {
        competitions: [
            "soccer_argentina_primera_division"
        ],
        name: 'Argentina',
        picture: 'https://flagcdn.com/ar.svg'
    },
    england: {
        competitions: [
            "soccer_england_league1",
            "soccer_epl",
            "soccer_england_efl_cup",
            "soccer_efl_champ",
            "soccer_england_league2",
            "soccer_fa_cup",
            "tennis_atp_wimbledon",
            "tennis_wta_wimbledon",
            "golf_the_open_championship_winner"
        ],
        name: 'England',
        picture: 'https://flagcdn.com/gb-eng.svg'
    },
    south_korea: {
        competitions: [
            "soccer_korea_kleague1"
        ],
        name: 'South Korea',
        picture: 'https://flagcdn.com/kr.svg'
    },
    scotland: {
        competitions: [
            "soccer_spl"
        ],
        name: 'Scotland',
        picture: 'https://flagcdn.com/gb-sct.svg'
    },
    greece: {
        competitions: [
            "soccer_greece_super_league"
        ],
        name: 'Greece',
        picture: 'https://flagcdn.com/gr.svg'
    },
    ireland: {
        competitions: [
            "soccer_league_of_ireland"
        ],
        name: 'Ireland',
        picture: 'https://flagcdn.com/ie.svg'
    },
    italy: {
        competitions: [
            "soccer_italy_serie_b",
            "soccer_italy_serie_a"
        ],
        name: 'Italy',
        picture: 'https://flagcdn.com/it.svg'
    },
    netherlands: {
        competitions: [
            "soccer_netherlands_eredivisie"
        ],
        name: 'Netherlands',
        picture: 'https://flagcdn.com/nl.svg'
    },
    sweden: {
        competitions: [
            "soccer_sweden_allsvenskan",
            "icehockey_sweden_allsvenskan",
            "soccer_sweden_superettan",
            "icehockey_sweden_hockey_league"
        ],
        name: 'Sweden',
        picture: 'https://flagcdn.com/se.svg'
    },
    finland: {
        competitions: [
            "soccer_finland_veikkausliiga"
        ],
        name: 'Finland',
        picture: 'https://flagcdn.com/fi.svg'
    },
    germany: {
        competitions: [
            "soccer_germany_bundesliga",
            "soccer_germany_bundesliga2",
            "soccer_germany_liga3"
        ],
        name: 'Germany',
        picture: 'https://flagcdn.com/de.svg'
    },
    portugal: {
        competitions: [
            "soccer_portugal_primeira_liga"
        ],
        name: 'Portugal',
        picture: 'https://flagcdn.com/pt.svg'
    },
    spain: {
        competitions: [
            "soccer_spain_la_liga",
            "soccer_spain_segunda_division"
        ],
        name: 'Spain',
        picture: 'https://flagcdn.com/es.svg'
    },
    south_america: {
        competitions: [
            "soccer_conmebol_copa_libertadores"
        ],
        name: 'South America',
        picture: 'https://flagpedia.net/data/org/w1160/usan.webp'
    },
    norway: {
        competitions: [
            "soccer_norway_eliteserien"
        ],
        name: 'Norway',
        picture: 'https://flagcdn.com/no.svg'
    },
    belgium: {
        competitions: [
            "soccer_belgium_first_div"
        ],
        name: 'Belgium',
        picture: 'https://flagcdn.com/be.svg'
    },
    turkey: {
        competitions: [
            "soccer_turkey_super_league"
        ],
        name: 'Turkey',
        picture: 'https://flagcdn.com/tr.svg'
    },
    switzerland: {
        competitions: [
            "soccer_switzerland_superleague"
        ],
        name: 'Switzerland',
        picture: 'https://flagcdn.com/ch.svg'
    },
    africa: {
        competitions: [
            "soccer_africa_cup_of_nations"
        ],
        name: 'Africa',
        picture: 'https://flagpedia.net/data/org/w1160/au.webp'
    },
    russia: {
        competitions: [
            "soccer_russia_premier_league"
        ],
        name: 'Russia',
        picture: 'https://flagcdn.com/ru.svg'
    },
    china: {
        competitions: [
            "soccer_china_superleague"
        ],
        name: 'China',
        picture: 'https://flagcdn.com/cn.svg'
    },

    poland: {
        competitions: [
            "soccer_poland_ekstraklasa"
        ],
        name: 'Poland',
        picture: 'https://flagcdn.com/pl.svg'
    },
    austria: {
        competitions: [
            "soccer_austria_bundesliga"
        ],
        name: 'Austria',
        picture: 'https://flagcdn.com/at.svg'
    },
    denmark: {
        competitions: [
            "soccer_denmark_superliga"
        ],
        name: 'Denmark',
        picture: 'https://flagcdn.com/dk.svg'
    },
    mexico: {
        competitions: [
            "soccer_mexico_ligamx"
        ],
        name: 'Mexico',
        picture: 'https://flagcdn.com/mx.svg'
    },
    japan: {
        competitions: [
            "soccer_japan_j_league"
        ],
        name: 'Japan',
        picture: 'https://flagcdn.com/jp.svg'
    }
}

export default countries
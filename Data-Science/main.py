import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# PAGE CONFIG

st.set_page_config(
    page_title="Dashboard Analisis Sampah",
    page_icon="♻️",
    layout="wide"
)

# DATASET

kategori_data = {
    "Kategori": [
        "Drug",
        "clothes",
        "Food",
        "glass",
        "plastic",
        "biological",
        "shoes",
        "cardboard",
        "paper",
        "tisu",
        "metal",
        "battery",
        "trash",
        "Leaf",
        "vegetables and fruits",
        "Pad and Diaper"
    ],
    "Jumlah": [
        1956,
        1892,
        1791,
        1736,
        1597,
        1479,
        1449,
        1411,
        1336,
        952,
        930,
        756,
        453,
        196,
        150,
        142
    ]
}

df = pd.DataFrame(kategori_data)

# KATEGORI BESAR

kategori_besar = {
    "Kategori Trash": [
        "Anorganik",
        "Organik",
        "Kertas",
        "B3",
        "Residu"
    ],
    "Jumlah": [
        7604,
        3616,
        2747,
        2712,
        1547
    ],
    "Jumlah Jenis": [
        5,
        4,
        2,
        2,
        3
    ]
}

df_besar = pd.DataFrame(kategori_besar)

# SIDEBAR

st.sidebar.title("♻️ Dashboard Sampah")

selected = st.sidebar.multiselect(
    "Pilih Kategori",
    df["Kategori"],
    default=df["Kategori"]
)

filtered_df = df[df["Kategori"].isin(selected)]

# HEADER

st.title("♻️ Dashboard Analisis Sampah")
st.markdown("Visualisasi Dataset Sampah")

# KPI

total_gambar = df["Jumlah"].sum()
rata_rata = round(df["Jumlah"].mean(), 2)

max_kategori = df.loc[df["Jumlah"].idxmax()]
min_kategori = df.loc[df["Jumlah"].idxmin()]

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        "Total Gambar",
        total_gambar
    )

with col2:
    st.metric(
        "Total Kelas",
        5
    )
    st.caption("Subkelas : 16")

with col3:
    st.metric(
        "Terbanyak",
        max_kategori["Kategori"]
    )
    st.caption(f"Total : {max_kategori['Jumlah']}")

with col4:
    st.metric(
        "Tersedikit",
        min_kategori["Kategori"]
    )
    st.caption(f"Total : {min_kategori['Jumlah']}")

st.divider()

# PIE CHART

colA, colB = st.columns([1,1])

with colA:

    st.subheader("📊 Distribusi Kategori")

    fig_pie = px.pie(
        filtered_df,
        values="Jumlah",
        names="Kategori",
        hole=0.4
    )

    st.plotly_chart(fig_pie, use_container_width=True)

with colB:

    st.subheader("📈 Bar Statistik")

    fig_bar = px.bar(
        filtered_df,
        x="Kategori",
        y="Jumlah",
        text_auto=True
    )

    st.plotly_chart(fig_bar, use_container_width=True)

# KATEGORI BESAR

st.subheader("♻️ Kategori Sampah Besar")

fig_besar = px.bar(
    df_besar,
    x="Kategori Trash",
    y="Jumlah",
    text="Jumlah",
    hover_data=["Jumlah Jenis"]
)

st.plotly_chart(fig_besar, use_container_width=True)

# Distribusi Sampah Besar

kategori_map = {
    "Anorganik": [
        "plastic",
        "glass",
        "metal",
        "clothes",
        "shoes"
    ],

    "Organik": [
        "Food",
        "Leaf",
        "vegetables and fruits",
        "biological"
    ],

    "Kertas": [
        "paper",
        "cardboard"
    ],

    "B3": [
        "Drug",
        "battery"
    ],

    "Residu": [
        "tisu",
        "trash",
        "Pad and Diaper"
    ]
}

st.subheader("♻️ Distribusi Sampah Besar")
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "♻️ Anorganik",
    "🌿 Organik",
    "📄 Kertas",
    "☣️ B3",
    "🗑️ Residu"
])

with tab1:
    st.header("Anorganik")
    data_anorganik = df[
        df["Kategori"].isin(
            kategori_map["Anorganik"]
        )
    ]

    col1, col2 = st.columns(2)

    with col1:

        fig = px.pie(
            data_anorganik,
            values="Jumlah",
            names="Kategori",
            hole=0.4
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:

        for _, row in data_anorganik.iterrows():

            with st.container(border=True):

                st.metric(
                    row["Kategori"],
                    row["Jumlah"]
                )

with tab2:
    st.header("Organik")
    data_organik = df[
        df["Kategori"].isin(
            kategori_map["Organik"]
        )
    ]

    col1, col2 = st.columns(2)

    with col1:

        fig = px.pie(
            data_organik,
            values="Jumlah",
            names="Kategori",
            hole=0.4
        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )

    with col2:

        for _, row in data_organik.iterrows():

            with st.container(border=True):

                st.metric(
                    row["Kategori"],
                    row["Jumlah"]
                )

with tab3:
    st.header("Kertas")
    data_kertas = df[
        df["Kategori"].isin(
            kategori_map["Kertas"]
        )
    ]

    col1, col2 = st.columns(2)

    with col1:

        fig = px.pie(
            data_kertas,
            values="Jumlah",
            names="Kategori",
            hole=0.4
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:

        for _, row in data_kertas.iterrows():

            with st.container(border=True):

                st.metric(
                    row["Kategori"],
                    row["Jumlah"]
                )

with tab4:
    st.header("B3")
    data_b3 = df[
        df["Kategori"].isin(
            kategori_map["B3"]
        )
    ]

    col1, col2 = st.columns(2)

    with col1:

        fig = px.pie(
            data_b3,
            values="Jumlah",
            names="Kategori",
            hole=0.4
        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )

    with col2:

        for _, row in data_b3.iterrows():

            with st.container(border=True):

                st.metric(
                    row["Kategori"],
                    row["Jumlah"]
                )

with tab5:
    st.header("Residu")
    data_residu = df[
        df["Kategori"].isin(
            kategori_map["Residu"]
        )
    ]

    col1, col2 = st.columns(2)

    with col1:

        fig = px.pie(
            data_residu,
            values="Jumlah",
            names="Kategori",
            hole=0.4
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:

        for _, row in data_residu.iterrows():

            with st.container(border=True):

                st.metric(
                    row["Kategori"],
                    row["Jumlah"]
                )

# TABLE DATA

st.subheader("📋 Data Lengkap")

st.dataframe(
    filtered_df,
    use_container_width=True
)

# RINGKASAN
st.subheader("📝 Ringkasan Dataset")

st.info(f"""
Total Seluruh Gambar : {total_gambar}

Rata-rata per Kelas : {rata_rata}

Data Terbanyak : {max_kategori['Kategori']} ({max_kategori['Jumlah']} gambar)

Data Tersedikit : {min_kategori['Kategori']} ({min_kategori['Jumlah']} gambar)
""")


# FOOTER
st.markdown("---")
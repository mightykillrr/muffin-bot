import { ModalSubmitInteraction } from "discord.js";
import { prisma } from "../../../prisma/db";

export const handleAddNewMovie = async (
  interaction: ModalSubmitInteraction,
) => {
  const {
    fields: { fields: modalFields },
  } = interaction;

  const title = modalFields.get("movie_name")?.value as string;
  const info_link = modalFields.get("info_link")?.value as string;
  const image_link = modalFields.get("image_link")?.value as string;
  const movie_description = modalFields.get("movie_description")
    ?.value as string;

  await prisma.movie.create({
    data: {
      title,
      info_link,
      image_link,
      description: movie_description,
    },
  });

  await interaction.followUp({
    content: "Movie added successfully!",
    ephemeral: true,
  });

  // await addRandomMoviesToDB();
  // console.log("Added random movies to DB");
};

// const addRandomMoviesToDB = async () => {
//   const arr = new Array(100)
//     .fill(null)
//     .map((_, i) => ({
//       title: `Movie ${i + 1}`,
//       info_link: `https://www.imdb.com/title/tt2191701/`,
//       image_link: `https://media.discordapp.net/attachments/1129614376199004172/1131054142924783717/depositphotos_331503262-stock-illustration-no-image-vector-symbol-missing.jpg`,
//       description: `Description ${i + 1}`,
//     }))
//     .map((i) => prisma.movie.create({ data: i }));
//
//   return Promise.all(arr);
// };

// export const addMovies = async () => {
//   const movies = [
//     {
//       title: "Star Wars: Episode I",
//       info_link: "https://www.youtube.com/watch?v=uMoSnrd7i5c",
//       image_link:
//         "https://m.media-amazon.com/images/M/MV5BYTRhNjcwNWQtMGJmMi00NmQyLWE2YzItODVmMTdjNWI0ZDA2XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
//       description: "The Phantom Menace",
//     },
//     {
//       title: "Extraction 2",
//       info_link: "https://www.youtube.com/watch?v=Y274jZs5s7s",
//       image_link:
//         "https://upload.wikimedia.org/wikipedia/en/0/02/Extraction_2_poster.jpg",
//       description: "Extraction 2",
//     },
//     {
//       title: "Tomb Raider (2018)",
//       info_link: "https://www.youtube.com/watch?v=3KkhD0MnaJU",
//       image_link:
//         "https://m.media-amazon.com/images/M/MV5BOTY4NDcyZGQtYmVlNy00ODgwLTljYTMtYzQ2OTE3NDhjODMwXkEyXkFqcGdeQXVyNzYzODM3Mzg@._V1_.jpg",
//       description: "Tomb Raider (2018)",
//     },
//   ];
//
//   return Promise.all(movies.map((i) => prisma.movie.create({ data: i })));
// };

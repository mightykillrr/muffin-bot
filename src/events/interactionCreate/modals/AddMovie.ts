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

  await prisma.movie.create({
    data: {
      title,
      info_link,
      image_link,
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
//       info_link: `https://example.com/image${i}.jpg`,
//       image_link: `https://example.com/info${i}.jpg`,
//     }))
//     .map((i) => prisma.movie.create({ data: i }));
//
//   return Promise.all(arr);
// };

import crypto from "node:crypto";
import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD = process.env.DISCORD_GUILD;
const STALWART_API_KEY = process.env.STALWART_API_KEY;
const DOMAIN = process.env.DOMAIN;

if (
  !DISCORD_CLIENT_ID ||
  !DISCORD_TOKEN ||
  !DISCORD_GUILD ||
  !STALWART_API_KEY ||
  !DOMAIN
) {
  throw new Error("Missing environment variables");
}

const commands = [
  new SlashCommandBuilder()
    .setName("create-email")
    .setDescription(`Create an email with the form prefix@${DOMAIN}`)
    .addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription(`prefix@${DOMAIN}`)
        .setRequired(true),
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

try {
  console.log("Started refreshing application (/) commands.");

  await rest.put(
    Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD),
    { body: commands },
  );

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case "create-email":
        await createEmail(interaction);
        break;
    }
  } catch (error) {
    console.error(error);

    const content =
      "There was an error while executing this command, more information has been logged.";

    if (
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply
    ) {
      await interaction.followUp({ content });
    } else {
      await interaction.reply({ content });
    }
  }
});

client.login(DISCORD_TOKEN);

async function createEmail(interaction: ChatInputCommandInteraction) {
  const prefix = interaction.options.getString("prefix");

  if (!prefix) {
    return await interaction.reply({
      content: "Missing prefix?",
      flags: [MessageFlags.Ephemeral],
    });
  }

  const password = crypto.randomBytes(8).toString("hex");

  const body = {
    using: [
      "urn:ietf:params:jmap:core",
      "urn:stalwart:jmap",
      "urn:ietf:params:jmap:blob",
      "urn:ietf:params:jmap:mail",
      "urn:ietf:params:jmap:calendars",
      "urn:ietf:params:jmap:contacts",
      "urn:ietf:params:jmap:principals",
      "urn:ietf:params:jmap:sieve",
      "urn:ietf:params:jmap:vacationresponse",
    ],
    methodCalls: [
      [
        "x:Account/set",
        {
          accountId: "b",
          create: {
            "new-0": {
              "@type": "User",
              aliases: {
                0: { enabled: true, name: prefix, domainId: "b" },
              },
              credentials: {
                0: { "@type": "Password", secret: password },
              },
              domainId: "b",
              encryptionAtRest: { "@type": "Disabled" },
              locale: "en_US",
              name: prefix,
              permissions: { "@type": "Inherit" },
              roles: { "@type": "User" },
            },
          },
        },
        "0",
      ],
    ],
  };

  const res = await fetch(`https://email.${DOMAIN}/jmap/`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${STALWART_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  console.log(
    `API response for '${interaction.user.username}' with '${prefix}: ${JSON.stringify(data)}`,
  );

  const [_type, info, _id] = data["methodResponses"][0];

  if (!("created" in info)) {
    throw new Error(`Error creating email account?`);
  }

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setTitle("Account Created")
        .setDescription(
          `Log into https://email.${DOMAIN}/ with these credentials and reset your password.`,
        )
        .addFields(
          { name: "email", value: `${prefix}@${DOMAIN}` },
          { name: "password", value: password },
        ),
    ],
    flags: [MessageFlags.Ephemeral],
  });
}

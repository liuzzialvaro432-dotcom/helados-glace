"use client";

import { useId, useState } from "react";

import { WhatsAppIcon } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT } from "@/lib/config";
import { MONTH_NAMES } from "@/lib/time";
import { buildCateringMessage, whatsappUrl } from "@/lib/whatsapp";

const EVENT_TYPES = ["Cumpleaños", "Boda", "Empresa", "Colegio", "Otro"];
const inputClass = "h-12 rounded-xl bg-card px-3.5 text-base md:text-base";

/** "2026-12-24" → "24 de diciembre de 2026" */
function readableDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${Number(match[3])} de ${MONTH_NAMES[Number(match[2]) - 1].toLowerCase()} de ${match[1]}`;
}

export function CateringForm() {
  const id = useId();
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [place, setPlace] = useState("");
  const [comments, setComments] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const message = buildCateringMessage({
      name,
      eventType,
      date: readableDate(date),
      guests,
      place,
      comments,
    });
    const url = whatsappUrl(CONTACT.catering.whatsapp, message);
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.href = url;
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-3xl border bg-card p-5 sm:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-primary">Pedí tu presupuesto</h2>
        <p className="text-sm text-muted-foreground">
          Completá lo que sepas: todos los campos son opcionales. Al enviar se abre WhatsApp con tu consulta lista.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-nombre`} className="text-sm font-semibold">
          Tu nombre
        </Label>
        <Input
          id={`${id}-nombre`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={60}
          className={inputClass}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Tipo de evento</legend>
        <RadioGroup value={eventType} onValueChange={(value) => setEventType(String(value))} className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <Label
              key={type}
              className="flex h-11 cursor-pointer items-center rounded-full border bg-card px-4 text-sm font-semibold has-data-checked:border-primary has-data-checked:bg-primary has-data-checked:text-primary-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
            >
              <RadioGroupItem value={type} className="sr-only!" />
              {type}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-fecha`} className="text-sm font-semibold">
            Fecha del evento
          </Label>
          <Input
            id={`${id}-fecha`}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-invitados`} className="text-sm font-semibold">
            Cantidad de invitados
          </Label>
          <Input
            id={`${id}-invitados`}
            inputMode="numeric"
            value={guests}
            onChange={(event) => setGuests(event.target.value.replace(/\D/g, ""))}
            maxLength={5}
            placeholder="Ej.: 80"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-lugar`} className="text-sm font-semibold">
          Lugar
        </Label>
        <Input
          id={`${id}-lugar`}
          value={place}
          onChange={(event) => setPlace(event.target.value)}
          maxLength={120}
          placeholder="Ciudad, barrio o salón"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-comentarios`} className="text-sm font-semibold">
          Contanos qué tenés en mente
        </Label>
        <Textarea
          id={`${id}-comentarios`}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          maxLength={400}
          rows={3}
          placeholder="Ej.: carrito de helados, tortas heladas, sabores preferidos…"
          className="rounded-xl bg-card text-base md:text-base"
        />
      </div>

      <Button type="submit" size="xl" className="h-auto min-h-12 rounded-full py-2 whitespace-normal">
        <WhatsAppIcon />
        Enviar consulta al {CONTACT.catering.display}
      </Button>
    </form>
  );
}

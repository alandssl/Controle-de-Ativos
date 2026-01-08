import * as React from "react"
import { PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface DataTableFilterProps {
    title: string
    options: {
        label: string
        value: string
    }[]
    selectedValues: string[]
    onSelect: (values: string[]) => void
}

export function DataTableFilter({
    title,
    options,
    selectedValues,
    onSelect,
}: DataTableFilterProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues?.length > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.length}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.length > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedValues.length} selecionados
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.includes(option.value))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.value}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]" align="start">
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value)
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onSelect={(e) => {
                                e.preventDefault();
                                if (isSelected) {
                                    onSelect(selectedValues.filter((value) => value !== option.value));
                                } else {
                                    onSelect([...selectedValues, option.value]);
                                }
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <Checkbox checked={isSelected} readOnly />
                                <span>{option.label}</span>
                            </div>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
